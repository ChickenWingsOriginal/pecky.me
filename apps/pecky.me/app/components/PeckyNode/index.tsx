"use client";

import { PeckyNodeStaking } from "./PeckyNodeStaking";
import { PeckyNodeUnstaking } from "./PeckyNodeUnstaking";
import { PeckyNodeOwned } from "./PeckyNodeOwned";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { useWallet } from "@/app/context/WalletContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// @ts-ignore
import { BCS } from "supra-l1-sdk";
import {
  fetchActiveNodesSorted,
  rarityLabel,
  serializeString,
} from "@/app/utils/nodeService";
import type { ActiveNode } from "@/app/context/WalletContext";
import { useTranslations } from "next-intl";

interface RarityNFT {
  tokenName: string;
  rarity: string;
}

interface NodeWithData extends ActiveNode {
  rewards?: number;
  rewardsLive?: number;
  apy?: number;
  linkedRarities?: RarityNFT[];
  availableRarities?: RarityNFT[];
}

const STAKE_MODULE =
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

export function PeckyNode() {
  const tOwned = useTranslations('staking.peckyNode.owned');
  const tStaking = useTranslations('staking.peckyNode.staking');
  const tUnstaking = useTranslations('staking.peckyNode.unstaking');
  const { sendTransaction } = useSupraConnect();
  const {
    state: walletState,
    refreshBalances,
    refreshStakingInfo,
    refreshNodeOperatorData,
  } = useWallet();
  const [allNodes, setAllNodes] = useState<NodeWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [claimingNodeId, setClaimingNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [unstakeAmounts, setUnstakeAmounts] = useState<Record<string, string>>(
    {},
  );
  const [unstakingNodeId, setUnstakingNodeId] = useState<string | null>(null);
  const [isClaimingUnstakes, setIsClaimingUnstakes] = useState(false);
  const [claimingUserRewardNodeId, setClaimingUserRewardNodeId] = useState<
    string | null
  >(null);

  const walletAddress = walletState.walletAddress;
  const peckyBalance = walletState.peckyBalance ?? BigInt(0);
  const pendingUnstakes = walletState.staking.peckyNode.pendingUnstakes;
  const userStakedNodes = walletState.staking.peckyNode.userStakedNodes;

  // Transform WalletContext ownedNodes to NodeWithData format
  const ownedNodes: NodeWithData[] =
    walletState.ownedNodes?.map((node) => {
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

      return {
        nodeId: node.nodeId,
        name: node.name,
        rewards: node.rewards,
        rewardsLive: node.rewardsLive,
        apy: node.apy,
        linkedRarities,
        availableRarities,
      };
    }) || [];

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
        toast.success(tOwned('unlinkSuccess', { tokenName }));
      } else {
        toast.error(`${tOwned('unlinkFailed')}: ${result.reason || result.error}`);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error(tOwned('unlinkFailed'));
      }
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
        toast.success(tOwned('linkSuccess', { tokenName }));
      } else {
        toast.error(`${tOwned('linkFailed')}: ${result.reason || result.error}`);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error(tOwned('linkFailed'));
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleRefreshNode = async (nodeId: string) => {
    try {
      await refreshNodeOperatorData();
    } catch (error) {
      console.error("Failed to refresh node data:", error);
      toast.error(tOwned('refreshFailed'));
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
        toast.success(tOwned('claimSuccess'));
        try {
          await refreshBalances();
          refreshNodeOperatorData();
        } catch (error) {
          console.error("Error refreshing wallet balance:", error);
        }
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error(`${tOwned('claimFailed')}: ${errorMsg}`);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error(tOwned('claimFailed'));
      }
    } finally {
      setIsClaimingRewards(false);
      setClaimingNodeId(null);
    }
  };

  const handleStake = async () => {
    if (!walletAddress || !selectedNodeId || !stakeAmount) return;

    setIsStaking(true);
    try {
      const amountNumber = parseFloat(stakeAmount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        toast.error(tStaking('enterAmount'));
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
        toast.success(
          tStaking('stakeSuccess', { amount: amountNumber.toLocaleString() }),
        );
        setStakeAmount("");
        setSelectedNodeId(null);
        try {
          await refreshBalances();
          await refreshStakingInfo();
        } catch (error) {
          console.error("Error refreshing wallet data:", error);
        }
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error(`${tStaking('stakeFailed')}: ${errorMsg}`);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "";
      if (
        errorMsg.includes("All transaction approaches failed") ||
        errorMsg.includes("User rejected")
      ) {
        console.log("Transaction cancelled by user");
      } else {
        toast.error(tStaking('stakeFailed'));
      }
    } finally {
      setIsStaking(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let nodesToUse: ActiveNode[] = [];

        if (walletState.allNodes && walletState.allNodes.length > 0) {
          nodesToUse = walletState.allNodes;
        } else {
          nodesToUse = await fetchActiveNodesSorted();
        }

        const nodesWithData: NodeWithData[] = nodesToUse.map((node) => ({
          nodeId: node.nodeId,
          name: node.name,
        }));

        setAllNodes(nodesWithData);
      } catch (error) {
        console.error("Failed to fetch all nodes:", error);
        setAllNodes([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [walletState.allNodes]); // Only depends on allNodes from WalletContext, not wallet connection

  const handleUnstake = async (nodeId: string) => {
    if (!walletAddress) return;

    const amount = unstakeAmounts[nodeId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(tUnstaking('enterValidAmount'));
      return;
    }

    const amountMicro = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
    const nodeStake = userStakedNodes.find((n) => n.nodeId === nodeId);
    const stakedAmount = nodeStake?.staked ?? BigInt(0);

    if (amountMicro > stakedAmount) {
      toast.error(
        tUnstaking('onlyHaveStaked', {
          amount: (Number(stakedAmount) / 1_000_000).toLocaleString()
        }),
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
          tUnstaking('unstakeSuccess', {
            amount: (Number(amountMicro) / 1_000_000).toLocaleString()
          }),
        );
        setUnstakeAmounts({ ...unstakeAmounts, [nodeId]: "" });

        refreshStakingInfo();
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error(`${tUnstaking('unstakeFailed')}: ${errorMsg}`);
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
        toast.error(tUnstaking('unstakeFailed'));
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
        toast.success(tUnstaking('claimSuccess'));

        // Refresh staking data and wallet balance
        refreshStakingInfo();
        await refreshBalances();
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error(`${tUnstaking('claimFailed')}: ${errorMsg}`);
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
        toast.error(tUnstaking('claimFailed'));
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
        toast.success(tUnstaking('claimUnstakesSuccess'));

        await refreshBalances();
        refreshStakingInfo();
      } else {
        const errorMsg = result.reason || result.error || "";
        if (
          errorMsg.includes("All transaction approaches failed") ||
          errorMsg.includes("User rejected")
        ) {
          console.log("Transaction cancelled by user");
        } else {
          toast.error(`${tUnstaking('claimUnstakesFailed')}: ${errorMsg}`);
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
        toast.error(tUnstaking('claimUnstakesFailed'));
      }
    } finally {
      setIsClaimingUnstakes(false);
    }
  };

  return (
    <>
      <PeckyNodeStaking
        allNodes={allNodes}
        ownedNodes={ownedNodes}
        isLoading={isLoading}
        peckyBalance={peckyBalance}
        walletAddress={walletAddress}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        isStaking={isStaking}
        handleStake={handleStake}
      />

      <PeckyNodeUnstaking
        pendingUnstakes={pendingUnstakes}
        userStakedNodes={userStakedNodes}
        unstakeAmounts={unstakeAmounts}
        setUnstakeAmounts={setUnstakeAmounts}
        isClaimingUnstakes={isClaimingUnstakes}
        unstakingNodeId={unstakingNodeId}
        claimingUserRewardNodeId={claimingUserRewardNodeId}
        handleClaimUnstakes={handleClaimUnstakes}
        handleUnstake={handleUnstake}
        handleClaimUserReward={handleClaimUserReward}
      />

      <PeckyNodeOwned
        walletAddress={walletAddress}
        isLoadingNodes={walletState.isLoadingNodes}
        ownedNodes={ownedNodes}
        handleRefreshNode={handleRefreshNode}
        handleClaimRewards={handleClaimRewards}
        isClaimingRewards={isClaimingRewards}
        claimingNodeId={claimingNodeId}
        handleUnlinkRarity={handleUnlinkRarity}
        isUnlinking={isUnlinking}
        handleLinkRarity={handleLinkRarity}
        isLinking={isLinking}
      />
    </>
  );
}
