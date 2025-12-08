"use client";

import { css } from "@/styled-system/css";
import { RetroBox } from "@/app/components/RetroBox";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { useWallet } from "@/app/context/WalletContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
// @ts-ignore
import { BCS } from "supra-l1-sdk";
import {
  getOperatorRewards,
  getOperatorApyForOwner,
  fetchActiveNodesSorted,
  rarityLabel,
  serializeString,
  getPendingUnstakes,
  getUserStake,
  getUserRewards,
  getUserStakedNodes,
  type UserStakeInfo,
} from "@/app/utils/nodeService";
import { formatCountdownFromTimestamp } from "@/app/utils/formatCountdownFromTimestamp";
import { formatTimestamp } from "@/app/utils/formatTimestamp";
import type { ActiveNode } from "@/app/context/WalletContext";
import type { PendingUnstake } from "@/app/utils/nodeService";

interface RarityNFT {
  tokenName: string;
  rarity: string;
}

interface NodeWithData extends ActiveNode {
  rewards?: number;
  apy?: number;
  linkedRarities?: RarityNFT[];
  availableRarities?: RarityNFT[];
}

export default function NodePage() {
  const { connectedWallet, sendTransaction } = useSupraConnect();
  const { state: walletState, refreshBalances } = useWallet();
  const [allNodes, setAllNodes] = useState<NodeWithData[]>([]);
  const [ownedNodes, setOwnedNodes] = useState<NodeWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [claimingNodeId, setClaimingNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [pendingUnstakes, setPendingUnstakes] = useState<PendingUnstake[]>([]);
  const [unstakeAmounts, setUnstakeAmounts] = useState<Record<string, string>>(
    {},
  );
  const [unstakingNodeId, setUnstakingNodeId] = useState<string | null>(null);
  const [isClaimingUnstakes, setIsClaimingUnstakes] = useState(false);
  const [userStakedNodes, setUserStakedNodes] = useState<UserStakeInfo[]>([]);
  const [claimingUserRewardNodeId, setClaimingUserRewardNodeId] = useState<
    string | null
  >(null);

  const walletAddress = connectedWallet?.walletAddress;
  const peckyBalance = walletState.peckyBalance ?? BigInt(0);

  const STAKE_MODULE =
    "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

  const handleUnlinkRarity = async (nodeId: string, tokenName: string) => {
    if (!walletAddress) return;
    setIsUnlinking(true);
    try {
      const serializedNodeId = serializeString(nodeId);
      const serializedTokenName = serializeString(tokenName);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "remove_rarity_nft",
          typeArguments: [],
          arguments: [serializedNodeId, serializedTokenName],
        },
      });
      if (result.success) {
        console.log("Unlinked:", tokenName);
      } else {
        console.error("Unlink failed:", result.reason || result.error);
      }
    } catch (error) {
      console.error("Unlink error:", error);
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleLinkRarity = async (nodeId: string, tokenName: string) => {
    if (!walletAddress) return;
    setIsLinking(true);
    try {
      const serializedNodeId = serializeString(nodeId);
      const serializedTokenName = serializeString(tokenName);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "add_rarity_nft",
          typeArguments: [],
          arguments: [serializedNodeId, serializedTokenName],
        },
      });
      if (result.success) {
        console.log("Linked:", tokenName);
      } else {
        console.error("Link failed:", result.reason || result.error);
      }
    } catch (error) {
      console.error("Link error:", error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleClaimRewards = async (nodeId: string) => {
    if (!walletAddress) return;
    setIsClaimingRewards(true);
    setClaimingNodeId(nodeId);
    try {
      const serializedNodeId = serializeString(nodeId);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "claim_node_reward",
          typeArguments: [],
          arguments: [serializedNodeId],
        },
      });
      if (result.success) {
        console.log("Rewards claimed for node:", nodeId);
        try {
          await refreshBalances();
          const updatedRewards = await getOperatorRewards(nodeId);
          setOwnedNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.nodeId === nodeId
                ? { ...node, rewards: updatedRewards }
                : node,
            ),
          );
        } catch (error) {
          console.error("Error refreshing wallet balance:", error);
        }
      } else {
        console.error("Claim failed:", result.reason || result.error);
      }
    } catch (error) {
      console.error("Claim error:", error);
    } finally {
      setIsClaimingRewards(false);
      setClaimingNodeId(null);
    }
  };

  const setPercentage = (percentage: number) => {
    const balanceNumber = Number(peckyBalance) / 1_000_000;
    const amount = (balanceNumber * percentage) / 100;
    setStakeAmount(amount.toString());
  };

  const handleStake = async () => {
    if (!walletAddress || !selectedNodeId || !stakeAmount) return;

    setIsStaking(true);
    try {
      const amountNumber = parseFloat(stakeAmount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        console.error("Invalid stake amount");
        setIsStaking(false);
        return;
      }
      const amountMicro = Math.floor(amountNumber * 1_000_000);

      const serializedNodeId = BCS.bcsSerializeStr(selectedNodeId);

      const buffer = new Uint8Array(8);
      const view = new DataView(buffer.buffer);
      view.setBigUint64(0, BigInt(amountMicro), true);
      const serializedAmount = new Uint8Array(buffer);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "stake_on_node",
          typeArguments: [],
          arguments: [serializedNodeId, serializedAmount],
        },
      });

      if (result.success) {
        console.log("Staked successfully:", {
          nodeId: selectedNodeId,
          amount: stakeAmount,
          txHash: result.txHash,
        });
        try {
          await refreshBalances();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error("Error refreshing wallet data:", error);
        }
        setStakeAmount("");
        setSelectedNodeId(null);
      } else {
        console.error("Stake failed:", result.reason || result.error);
      }
    } catch (error) {
      console.error("Stake error:", error);
    } finally {
      setIsStaking(false);
    }
  };

  useEffect(() => {
    if (!walletState.ownedNodes || walletState.ownedNodes.length === 0) {
      setOwnedNodes([]);
      return;
    }

    const ownedNodesData = walletState.ownedNodes;

    (async () => {
      try {
        const nodesWithData: NodeWithData[] = [];
        for (let i = 0; i < ownedNodesData.length; i++) {
          const node = ownedNodesData[i];
          if (i > 0) await new Promise((resolve) => setTimeout(resolve, 10));

          const [rewards, apy] = await Promise.all([
            getOperatorRewards(node.nodeId),
            getOperatorApyForOwner(node.nodeId),
          ]);

          const linkedRarities = node.linkedRarities.map((tokenName) => ({
            tokenName,
            rarity: rarityLabel(tokenName),
          }));

          const availableRarities = (walletState.availableRarityNfts || []).map(
            (tokenName) => ({
              tokenName,
              rarity: rarityLabel(tokenName),
            }),
          );

          nodesWithData.push({
            nodeId: node.nodeId,
            name: node.name,
            rewards,
            apy,
            linkedRarities,
            availableRarities,
          });
        }

        setOwnedNodes(nodesWithData);
        console.log("Owned nodes with data:", nodesWithData);
      } catch (error) {
        console.error("Failed to fetch node data:", error);
        setOwnedNodes([]);
      }
    })();
  }, [walletState.ownedNodes, walletState.availableRarityNfts]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let nodesToUse: ActiveNode[] = [];

        if (walletState.allNodes && walletState.allNodes.length > 0) {
          nodesToUse = walletState.allNodes;
          console.log("Using cached allNodes from context:", nodesToUse);
        } else {
          nodesToUse = await fetchActiveNodesSorted();
          console.log("Fetched fresh allNodes:", nodesToUse);
        }

        const nodesWithApy: NodeWithData[] = [];
        for (let i = 0; i < nodesToUse.length; i++) {
          const node = nodesToUse[i];
          if (i > 0) await new Promise((resolve) => setTimeout(resolve, 10));

          const apy = await getOperatorApyForOwner(node.nodeId);

          nodesWithApy.push({
            nodeId: node.nodeId,
            name: node.name,
            apy,
          });
        }

        setAllNodes(nodesWithApy);
        console.log("All nodes with APY:", nodesWithApy);
      } catch (error) {
        console.error("Failed to fetch all nodes:", error);
        setAllNodes([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [walletAddress, walletState.allNodes]);

  useEffect(() => {
    if (!walletAddress) {
      setPendingUnstakes([]);
      setUserStakedNodes([]);
      return;
    }

    (async () => {
      try {
        const [unstakes, stakedNodes] = await Promise.all([
          getPendingUnstakes(walletAddress),
          getUserStakedNodes(walletAddress),
        ]);

        setPendingUnstakes(unstakes);
        setUserStakedNodes(stakedNodes);
      } catch (error) {
        console.error("Failed to fetch unstakes/stakes:", error);
      }
    })();
  }, [walletAddress]);

  const handleUnstake = async (nodeId: string) => {
    if (!walletAddress) return;

    const amount = unstakeAmounts[nodeId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount to unstake");
      return;
    }

    const amountMicro = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
    const nodeStake = userStakedNodes.find((n) => n.nodeId === nodeId);
    const stakedAmount = nodeStake?.staked ?? BigInt(0);

    if (amountMicro > stakedAmount) {
      toast.error(
        `You only have ${(Number(stakedAmount) / 1_000_000).toLocaleString()} $Pecky staked`,
      );
      return;
    }

    setUnstakingNodeId(nodeId);
    try {
      const serializedNodeId = serializeString(nodeId);

      const buffer = new Uint8Array(8);
      const view = new DataView(buffer.buffer);
      view.setBigUint64(0, amountMicro, true);
      const serializedAmount = new Uint8Array(buffer);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "unstake_from_node",
          typeArguments: [],
          arguments: [serializedNodeId, serializedAmount],
        },
      });

      if (result.success) {
        console.log("Unstaked successfully:", nodeId);
        toast.success(
          `Unstaked ${(Number(amountMicro) / 1_000_000).toLocaleString()} $Pecky`,
        );
        setUnstakeAmounts({ ...unstakeAmounts, [nodeId]: "" });

        const [unstakes, stakedNodes] = await Promise.all([
          getPendingUnstakes(walletAddress),
          getUserStakedNodes(walletAddress),
        ]);

        setPendingUnstakes(unstakes);
        setUserStakedNodes(stakedNodes);
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error("Unstake failed: " + errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Unstake error:", error);
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error("Unstake failed");
      }
    } finally {
      setUnstakingNodeId(null);
    }
  };

  const handleClaimUserReward = async (nodeId: string) => {
    if (!walletAddress) return;

    setClaimingUserRewardNodeId(nodeId);
    try {
      const serializedNodeId = serializeString(nodeId);

      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "claim_user_reward",
          typeArguments: [],
          arguments: [serializedNodeId],
        },
      });

      if (result.success) {
        console.log("User reward claimed for node:", nodeId);
        toast.success("Rewards claimed successfully!");

        // Refresh user staked nodes to update rewards
        const stakedNodes = await getUserStakedNodes(walletAddress);
        setUserStakedNodes(stakedNodes);

        // Refresh wallet balance
        await refreshBalances();
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error("Claim failed: " + errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Claim user reward error:", error);
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error("Claim failed");
      }
    } finally {
      setClaimingUserRewardNodeId(null);
    }
  };

  const handleClaimUnstakes = async () => {
    if (!walletAddress) return;

    setIsClaimingUnstakes(true);
    try {
      const result = await sendTransaction({
        payload: {
          moduleAddress: STAKE_MODULE,
          moduleName: "stake",
          functionName: "claim_unstake",
          typeArguments: [],
          arguments: [],
        },
      });

      if (result.success) {
        console.log("Claimed unstakes successfully");
        toast.success("Claimed unstaked funds!");

        await refreshBalances();
        const unstakes = await getPendingUnstakes(walletAddress);
        setPendingUnstakes(unstakes);
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error("Claim failed: " + errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Claim unstakes error:", error);
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error("Claim failed");
      }
    } finally {
      setIsClaimingUnstakes(false);
    }
  };

  return (
    <div
      className={css({
        minH: "100vh",
        bg: "#fff3da",
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        pb: "100px",
      })}
    >
      <main
        className={css({
          maxW: "520px",
          w: "90%",
          mt: "40px",
          display: "flex",
          flexDir: "column",
          gap: "4px",
        })}
      >
        <RetroBox>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <Image
              src="/images/node.png"
              alt="Node icon"
              width={96}
              height={96}
            />
          </div>
          <div
            className={css({
              fontSize: "13px",
              color: "#4a2c00",
              lineHeight: "1.7",
            })}
          >
            <div
              className={css({
                fontWeight: "700",
                fontSize: "15px",
                mb: "12px",
                color: "#a06500",
              })}
            >
              Pecky Node Operator — Key Things to Know
            </div>

            <div className={css({ fontWeight: "600", mb: "6px", mt: "12px" })}>
              Activation
            </div>
            <ul
              className={css({
                pl: "20px",
                m: "0 0 8px 0",
                lineHeight: "1.5",
                fontSize: "12px",
              })}
            >
              <li>You must own the Pecky Node Original NFT.</li>
              <li>
                You must have a minimum amount of Pecky LP tokens:
                <ul
                  className={css({
                    pl: "20px",
                    mt: "4px",
                    mb: "4px",
                  })}
                >
                  <li>Dexlyn LP tokens → 100M</li>
                  <li>ATMOS LP tokens (50/50 weighted pool) → 1M</li>
                  <li>Or a combination of both</li>
                </ul>
              </li>
            </ul>

            <div
              className={css({
                bg: "#fff3e8",
                p: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #ffb84d",
                mb: "12px",
                fontSize: "12px",
              })}
            >
              <div
                className={css({
                  fontWeight: "600",
                  mb: "4px",
                  color: "#c55000",
                })}
              >
                ⚠️ Important:
              </div>
              <div className={css({ color: "#8a4000" })}>
                If your node becomes inactive (you lose the NFT or LP tokens):
                <ul className={css({ pl: "20px", m: "4px 0 0 0" })}>
                  <li>All unclaimed operator rewards are lost immediately.</li>
                  <li>
                    Reward accumulation stops until you're eligible again.
                  </li>
                  <li>When reactivated, you start earning from zero again.</li>
                </ul>
              </div>
            </div>

            <div className={css({ fontWeight: "600", mb: "6px", mt: "12px" })}>
              Boosting APY with Rarity NFTs
            </div>
            <ul
              className={css({
                pl: "20px",
                m: "0 0 8px 0",
                lineHeight: "1.5",
                fontSize: "12px",
              })}
            >
              <li>Attach Chicken Wings Original NFTs to increase your APY.</li>
              <li>
                Per rarity boost:
                <ul className={css({ pl: "20px", mt: "4px", mb: "4px" })}>
                  <li>Common → +0.5%</li>
                  <li>Rare → +1.0%</li>
                  <li>Epic → +1.5%</li>
                  <li>Legendary → +2.0%</li>
                  <li>Mythic → +2.5%</li>
                </ul>
              </li>
              <li>
                Each rarity can be linked once (cannibals can be linked extra).
              </li>
              <li>
                You must hold the NFTs in your wallet — if you sell or lose
                them, they stop counting.
              </li>
            </ul>

            <div className={css({ fontWeight: "600", mb: "6px", mt: "12px" })}>
              Operator Rewards
            </div>
            <ul
              className={css({
                pl: "20px",
                m: "0 0 8px 0",
                lineHeight: "1.5",
                fontSize: "12px",
              })}
            >
              <li>
                You earn rewards based on:
                <ul className={css({ pl: "20px", mt: "4px", mb: "4px" })}>
                  <li>The total PECKY staked on your node, and</li>
                  <li>Your attached rarity NFTs (which define your APY).</li>
                </ul>
              </li>
              <li>Claim regularly (&lt;30 days) to keep rewards growing.</li>
              <li>
                Payouts come from the global staking vault — if empty, the
                staking period has come to an end.
              </li>
            </ul>

            <div className={css({ fontWeight: "600", mb: "6px", mt: "12px" })}>
              Good Habits
            </div>
            <ul
              className={css({
                pl: "20px",
                m: "0",
                lineHeight: "1.5",
                fontSize: "12px",
              })}
            >
              <li>✅ Keep your Node NFT and LP tokens intact.</li>
              <li>✅ Claim at least once every 30 days.</li>
              <li>✅ Hold attached NFTs to maintain your boosted APY.</li>
              <li>
                ✅ Avoid deactivation — once inactive, you lose your unclaimed
                rewards.
              </li>
            </ul>
          </div>
        </RetroBox>

        <RetroBox>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <h2
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#a06500",
              })}
            >
              Your Nodes
            </h2>
          </div>

          {!walletAddress ? (
            <div
              className={css({
                textAlign: "center",
                p: "24px",
                color: "#b48512",
                fontSize: "13px",
              })}
            >
              Connect your wallet to see your owned nodes
            </div>
          ) : walletState.isLoadingNodes ? (
            <div
              className={css({
                textAlign: "center",
                p: "24px",
                color: "#b48512",
                fontSize: "13px",
              })}
            >
              Loading your nodes...
            </div>
          ) : ownedNodes.length > 0 ? (
            <div
              className={css({
                display: "flex",
                flexDir: "column",
                gap: "12px",
              })}
            >
              {ownedNodes.map((node) => (
                <div
                  key={node.nodeId}
                  className={css({
                    p: "16px",
                    bg: "#fffbe8",
                    borderRadius: "12px",
                    border: "2px solid #ffaa00",
                  })}
                >
                  <div
                    className={css({
                      position: "relative",
                      w: "100%",
                      mb: "12px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    })}
                  >
                    <img
                      src={`https://smartnft.pecky.me/animation/pecky-node/${node.nodeId}.gif?cb=${Math.floor(Date.now() / (15 * 60 * 1000)) * (15 * 60 * 1000)}`}
                      alt={node.name}
                      loading="lazy"
                      className={css({
                        w: "100%",
                        objectFit: "cover",
                      })}
                    />
                  </div>
                  <div className={css({ mb: "12px" })}>
                    <div
                      className={css({
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#a06500",
                        mb: "4px",
                      })}
                    >
                      {node.name}
                    </div>
                    <div
                      className={css({ fontSize: "12px", color: "#b48512" })}
                    >
                      ID: {node.nodeId}
                    </div>
                  </div>
                  <div
                    className={css({
                      fontSize: "12px",
                      color: "#b48512",
                      mb: "6px",
                    })}
                  >
                    Operator APY: <strong>{(node.apy ?? 0).toFixed(2)}%</strong>
                  </div>
                  <div
                    className={css({
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#ff7700",
                      mb: "12px",
                    })}
                  >
                    <div>
                      Operator rewards:{" "}
                      <strong>
                        {(node.rewards ?? 0).toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        $Pecky
                      </strong>
                    </div>
                    <button
                      onClick={() => handleClaimRewards(node.nodeId)}
                      disabled={
                        !(node.rewards && node.rewards > 0) || isClaimingRewards
                      }
                      className={css({
                        fontSize: "11px",
                        px: "12px",
                        py: "4px",
                        bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        fontWeight: "600",
                        cursor:
                          !(node.rewards && node.rewards > 0) ||
                          isClaimingRewards
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          !(node.rewards && node.rewards > 0) ||
                          isClaimingRewards
                            ? 0.4
                            : 1,
                        transition: "opacity 0.2s ease",
                      })}
                    >
                      {isClaimingRewards && claimingNodeId === node.nodeId
                        ? "Claiming..."
                        : "Claim"}
                    </button>
                  </div>

                  {node.linkedRarities && node.linkedRarities.length > 0 && (
                    <div
                      className={css({
                        mb: "12px",
                        pb: "12px",
                        borderBottom: "1px dashed #ffd36e",
                      })}
                    >
                      <div
                        className={css({
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#513d0a",
                          mb: "8px",
                        })}
                      >
                        Unlink rarity NFT
                      </div>
                      {node.linkedRarities.map((rarity) => (
                        <div
                          key={`${node.nodeId}-linked-${rarity.tokenName}`}
                          className={css({
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: "6px",
                            p: "8px",
                            bg: "#fff",
                            borderRadius: "8px",
                          })}
                        >
                          <div
                            className={css({
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#a06500",
                            })}
                          >
                            {rarity.tokenName} — {rarity.rarity}
                          </div>
                          <button
                            onClick={() =>
                              handleUnlinkRarity(node.nodeId, rarity.tokenName)
                            }
                            disabled={isUnlinking}
                            className={css({
                              fontSize: "11px",
                              px: "8px",
                              py: "4px",
                              bg: "white",
                              border: "1px solid #ff7700",
                              borderRadius: "6px",
                              color: "#ff7700",
                              fontWeight: "600",
                              cursor: isUnlinking ? "not-allowed" : "pointer",
                            })}
                          >
                            {isUnlinking ? "..." : "Unlink"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {node.availableRarities &&
                    node.availableRarities.length > 0 && (
                      <div className={css({ mb: "12px" })}>
                        <div
                          className={css({
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#513d0a",
                            mb: "8px",
                          })}
                        >
                          Link rarity NFT
                        </div>
                        {node.availableRarities.map((rarity) => (
                          <div
                            key={`${node.nodeId}-available-${rarity.tokenName}`}
                            className={css({
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: "6px",
                              p: "8px",
                              bg: "#fff",
                              borderRadius: "8px",
                            })}
                          >
                            <div className={css({ flex: "1" })}>
                              <div
                                className={css({
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#a06500",
                                })}
                              >
                                {rarity.tokenName} — {rarity.rarity}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleLinkRarity(node.nodeId, rarity.tokenName)
                              }
                              disabled={isLinking}
                              className={css({
                                fontSize: "11px",
                                px: "8px",
                                py: "4px",
                                bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                fontWeight: "600",
                                cursor: isLinking ? "not-allowed" : "pointer",
                              })}
                            >
                              {isLinking ? "..." : "Link"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={css({
                textAlign: "center",
                p: "24px",
                color: "#b48512",
                fontSize: "13px",
              })}
            >
              You don't own any active nodes
            </div>
          )}
        </RetroBox>

        <RetroBox>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <h2
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#a06500",
                mb: "4px",
              })}
            >
              Active Pecky Node Operators
            </h2>
            <p
              className={css({
                fontSize: "12px",
                color: "#b48512",
                m: "0",
              })}
            >
              Choose the node you'd like to stake on
            </p>
          </div>

          {isLoading ? (
            <div
              className={css({
                textAlign: "center",
                p: "24px",
                color: "#b48512",
                fontSize: "13px",
              })}
            >
              Loading active nodes...
            </div>
          ) : allNodes.length > 0 ? (
            <>
              <div
                className={css({
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  mb: "20px",
                  pb: "20px",
                  borderBottom: "2px dashed #ffd36e",
                })}
              >
                {allNodes.map((node) => {
                  const isOwned = ownedNodes.some((owned) => {
                    console.log(node);
                    return owned.nodeId === node.nodeId;
                  });
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => setSelectedNodeId(node.nodeId)}
                      className={css({
                        p: "14px",
                        bg:
                          selectedNodeId === node.nodeId
                            ? "#fff8e8"
                            : "#fffbe8",
                        borderRadius: "12px",
                        border:
                          selectedNodeId === node.nodeId
                            ? "3px solid #ff7700"
                            : "2px solid #ffae00",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDir: "column",
                        alignItems: "center",
                        gap: "8px",
                        textAlign: "center",
                        boxSizing: "border-box",
                        boxShadow: isOwned
                          ? "0 0 20px rgba(255, 119, 0, 0.5), 0 0 10px rgba(255, 119, 0, 0.3)"
                          : "none",
                        _hover: {
                          transform: "translateY(-2px)",
                        },
                      })}
                    >
                      <input
                        type="radio"
                        name="selectedNode"
                        value={node.nodeId}
                        checked={selectedNodeId === node.nodeId}
                        onChange={() => setSelectedNodeId(node.nodeId)}
                        style={{ display: "none" }}
                      />
                      <div>
                        <div
                          className={css({
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#a06500",
                            mb: "4px",
                          })}
                        >
                          {node.name}
                        </div>
                        <div
                          className={css({
                            fontSize: "12px",
                            color: "#b48512",
                            fontWeight: "600",
                          })}
                        >
                          APY:{" "}
                          <strong className={css({ color: "#ff7700" })}>
                            {(node.apy ?? 0).toFixed(2)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={css({
                  display: "flex",
                  flexDir: "column",
                  gap: "12px",
                })}
              >
                <div
                  className={css({
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#513d0a",
                    textAlign: "center",
                  })}
                >
                  Stake $Pecky to{" "}
                  {allNodes.find((n) => n.nodeId === selectedNodeId)?.name}
                </div>

                {walletState.isConnected && (
                  <div
                    className={css({
                      fontSize: "12px",
                      color: "#b48512",
                      p: "8px",
                      bg: "#fff9f0",
                      borderRadius: "8px",
                      textAlign: "center",
                    })}
                  >
                    Available:{" "}
                    {(Number(peckyBalance) / 1_000_000).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}{" "}
                    $Pecky
                  </div>
                )}

                <input
                  type="number"
                  placeholder="Amount in $Pecky"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className={css({
                    w: "100%",
                    p: "10px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #ffae00",
                    fontSize: "13px",
                    bg: "white",
                    color: "#222",
                    boxSizing: "border-box",
                  })}
                />

                <div
                  className={css({
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "6px",
                  })}
                >
                  <button
                    onClick={() => setPercentage(25)}
                    className={css({
                      p: "8px",
                      bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      _hover: { transform: "scale(1.05)" },
                    })}
                  >
                    25%
                  </button>
                  <button
                    onClick={() => setPercentage(50)}
                    className={css({
                      p: "8px",
                      bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      _hover: { transform: "scale(1.05)" },
                    })}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setPercentage(75)}
                    className={css({
                      p: "8px",
                      bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      _hover: { transform: "scale(1.05)" },
                    })}
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setPercentage(100)}
                    className={css({
                      p: "8px",
                      bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      _hover: { transform: "scale(1.05)" },
                    })}
                  >
                    MAX
                  </button>
                </div>

                <button
                  onClick={handleStake}
                  disabled={!selectedNodeId || !stakeAmount || isStaking}
                  className={css({
                    w: "100%",
                    p: "10px",
                    bg:
                      !selectedNodeId || !stakeAmount || isStaking
                        ? "#cccccc"
                        : "linear-gradient(to right, #ffaa00, #ff7700)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor:
                      !selectedNodeId || !stakeAmount || isStaking
                        ? "not-allowed"
                        : "pointer",
                  })}
                >
                  {isStaking ? "Staking..." : "Stake"}
                </button>
              </div>
            </>
          ) : (
            <div
              className={css({
                textAlign: "center",
                p: "24px",
                color: "#b48512",
                fontSize: "13px",
              })}
            >
              No active nodes found
            </div>
          )}
        </RetroBox>

        <RetroBox>
          <div className={css({ mb: "16px" })}>
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: "12px",
              })}
            >
              <h3
                className={css({
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#a06500",
                  m: "0",
                })}
              >
                Pending unstakes
              </h3>
              <button
                onClick={handleClaimUnstakes}
                disabled={
                  isClaimingUnstakes ||
                  !pendingUnstakes.some((u) => u.claimable)
                }
                className={css({
                  fontSize: "13px",
                  px: "14px",
                  py: "8px",
                  bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  fontWeight: "600",
                  cursor:
                    isClaimingUnstakes ||
                    !pendingUnstakes.some((u) => u.claimable)
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isClaimingUnstakes ||
                    !pendingUnstakes.some((u) => u.claimable)
                      ? 0.4
                      : 1,
                  transition: "opacity 0.2s ease",
                })}
              >
                {isClaimingUnstakes
                  ? "Claiming..."
                  : `Claim unstaked ${pendingUnstakes.filter((u) => u.claimable).length > 0 ? `(${pendingUnstakes.filter((u) => u.claimable).length})` : ""}`}
              </button>
            </div>

            {pendingUnstakes.length === 0 ? (
              <div
                className={css({
                  textAlign: "center",
                  p: "16px",
                  fontSize: "13px",
                  color: "#888",
                })}
              >
                No pending unstakes.
              </div>
            ) : (
              <div
                className={css({
                  display: "flex",
                  flexDir: "column",
                  gap: "8px",
                })}
              >
                {pendingUnstakes.map((unstake, idx) => (
                  <div
                    key={idx}
                    className={css({
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "8px",
                      alignItems: "center",
                      p: "10px 12px",
                      border: "1.5px dashed #ffd36e",
                      borderRadius: "12px",
                      bg: "#fffbe8",
                    })}
                  >
                    <div>
                      <div
                        className={css({
                          fontSize: "13px",
                          color: "#7a5a11",
                        })}
                      >
                        Release:{" "}
                        <strong>
                          {unstake.claimable
                            ? "ready"
                            : formatTimestamp(unstake.release)}
                        </strong>{" "}
                        <span className={css({ opacity: 0.75 })}>
                          (
                          {unstake.claimable
                            ? "✓ claimable"
                            : `release in ${formatCountdownFromTimestamp(unstake.release)}`}
                          )
                        </span>
                      </div>
                      <div
                        className={css({
                          fontSize: "13px",
                          color: "#7a5a11",
                        })}
                      >
                        Amount:{" "}
                        <strong>
                          {(
                            Number(unstake.amountMicro) / 1_000_000
                          ).toLocaleString()}{" "}
                          $Pecky
                        </strong>
                      </div>
                    </div>
                    <div
                      className={css({
                        fontSize: "12px",
                        color: unstake.claimable ? "#2a8f3a" : "#9a7c2a",
                        textAlign: "right",
                      })}
                    >
                      {unstake.claimable ? "ready" : "pending"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={css({
                fontSize: "12px",
                color: "#888",
                textAlign: "center",
                mt: "12px",
                pt: "12px",
                borderTop: "1.7px dashed #ffd36e",
              })}
            >
              Claims become available after the unlock time.
            </div>
          </div>

          {userStakedNodes.length > 0 && (
            <div>
              <hr
                className={css({
                  my: "16px",
                  borderTop: "1.7px dashed #ffd36e",
                  opacity: 0.65,
                })}
              />
              <h3
                className={css({
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#a06500",
                  mb: "12px",
                  mt: "0",
                })}
              >
                Your node stakes
              </h3>
              <div
                className={css({
                  display: "flex",
                  flexDir: "column",
                  gap: "10px",
                })}
              >
                {userStakedNodes.map((node) => {
                  const stakedAmount = node.staked;
                  const rewardsAmount = node.rewards;

                  return (
                    <div
                      key={node.nodeId}
                      className={css({
                        p: "10px 12px",
                        border: "1.5px dashed #ffd36e",
                        borderRadius: "14px",
                        bg: "#fffbe8",
                      })}
                    >
                      <div className={css({ mb: "8px" })}>
                        <div
                          className={css({
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#4a2c00",
                          })}
                        >
                          {node.displayName}
                        </div>
                        <div
                          className={css({
                            fontSize: "12px",
                            color: "#7a5a11",
                            mt: "2px",
                          })}
                        >
                          {node.nodeId}
                        </div>
                        <div
                          className={css({
                            fontSize: "13px",
                            color: "#7a5a11",
                            mt: "4px",
                          })}
                        >
                          Staked:{" "}
                          <strong>
                            {(
                              Number(stakedAmount) / 1_000_000
                            ).toLocaleString()}{" "}
                            $Pecky
                          </strong>
                        </div>
                        <div
                          className={css({
                            fontSize: "13px",
                            color: "#7a5a11",
                          })}
                        >
                          Rewards:{" "}
                          <strong>
                            {(Number(rewardsAmount) / 1_000_000).toLocaleString(
                              "en-US",
                              { maximumFractionDigits: 2 },
                            )}{" "}
                            $Pecky
                          </strong>
                        </div>
                      </div>

                      <div
                        className={css({
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        })}
                      >
                        <div
                          className={css({
                            display: "flex",
                            gap: "6px",
                            flex: "1",
                          })}
                        >
                          <input
                            type="number"
                            placeholder="Amount to unstake"
                            value={unstakeAmounts[node.nodeId] || ""}
                            onChange={(e) =>
                              setUnstakeAmounts({
                                ...unstakeAmounts,
                                [node.nodeId]: e.target.value,
                              })
                            }
                            className={css({
                              flex: "1",
                              minW: "140px",
                              p: "10px 12px",
                              borderRadius: "10px",
                              border: "1.5px solid #ffae00",
                              bg: "#fff",
                              fontSize: "13px",
                              height: "40px",
                            })}
                          />
                          <button
                            onClick={() =>
                              setUnstakeAmounts({
                                ...unstakeAmounts,
                                [node.nodeId]: (
                                  Number(stakedAmount) / 1_000_000
                                ).toString(),
                              })
                            }
                            className={css({
                              px: "14px",
                              height: "40px",
                              borderRadius: "10px",
                              bg: "white",
                              border: "1.5px solid #ffae00",
                              color: "#ff7700",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            })}
                          >
                            MAX
                          </button>
                        </div>
                        <button
                          onClick={() => handleUnstake(node.nodeId)}
                          disabled={unstakingNodeId === node.nodeId}
                          className={css({
                            height: "40px",
                            px: "16px",
                            borderRadius: "10px",
                            bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                            border: "none",
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor:
                              unstakingNodeId === node.nodeId
                                ? "not-allowed"
                                : "pointer",
                            opacity: unstakingNodeId === node.nodeId ? 0.6 : 1,
                          })}
                        >
                          {unstakingNodeId === node.nodeId
                            ? "Unstaking..."
                            : "Unstake"}
                        </button>
                      </div>

                      <button
                        onClick={() => handleClaimUserReward(node.nodeId)}
                        disabled={
                          claimingUserRewardNodeId === node.nodeId ||
                          rewardsAmount === BigInt(0)
                        }
                        className={css({
                          w: "100%",
                          height: "40px",
                          px: "16px",
                          borderRadius: "10px",
                          bg:
                            claimingUserRewardNodeId === node.nodeId ||
                            rewardsAmount === BigInt(0)
                              ? "#cccccc"
                              : "linear-gradient(to right, #ffaa00, #ff7700)",
                          border: "none",
                          color: "white",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor:
                            claimingUserRewardNodeId === node.nodeId ||
                            rewardsAmount === BigInt(0)
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            claimingUserRewardNodeId === node.nodeId ||
                            rewardsAmount === BigInt(0)
                              ? 0.6
                              : 1,
                          mt: "8px",
                        })}
                      >
                        {claimingUserRewardNodeId === node.nodeId
                          ? "Claiming..."
                          : "Claim Rewards"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div
                className={css({
                  fontSize: "12px",
                  color: "#888",
                  textAlign: "center",
                  mt: "12px",
                  pt: "12px",
                  borderTop: "1.7px dashed #ffd36e",
                })}
              >
                Claim rewards or unstake anytime (2 days unlock period before
                claiming unstaked funds).
              </div>
            </div>
          )}
        </RetroBox>
      </main>
    </div>
  );
}
