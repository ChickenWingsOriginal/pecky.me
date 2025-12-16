"use client";

import { css } from "@/styled-system/css";
import { RetroBox } from "../RetroBox";

interface RarityNFT {
  tokenName: string;
  rarity: string;
}

interface NodeWithData {
  nodeId: string;
  name: string;
  rewards?: number;
  rewardsLive?: number;
  apy?: number;
  linkedRarities?: RarityNFT[];
  availableRarities?: RarityNFT[];
}

interface PeckyNodeOwnedProps {
  walletAddress: string | null;
  isLoadingNodes: boolean;
  ownedNodes: NodeWithData[];
  handleRefreshNode: (nodeId: string) => void;
  handleClaimRewards: (nodeId: string) => void;
  isClaimingRewards: boolean;
  claimingNodeId: string | null;
  handleUnlinkRarity: (nodeId: string, tokenName: string) => void;
  isUnlinking: boolean;
  handleLinkRarity: (nodeId: string, tokenName: string) => void;
  isLinking: boolean;
}

export function PeckyNodeOwned({
  walletAddress,
  isLoadingNodes,
  ownedNodes,
  handleRefreshNode,
  handleClaimRewards,
  isClaimingRewards,
  claimingNodeId,
  handleUnlinkRarity,
  isUnlinking,
  handleLinkRarity,
  isLinking,
}: PeckyNodeOwnedProps) {
  return (
    <>
      <RetroBox startOpen={false}>
        <RetroBox.Title showToggle>
          Pecky Node Operator: Things to Know
        </RetroBox.Title>
        <RetroBox.Content>
          <div
            className={css({
              fontSize: "13px",
              color: "#4a2c00",
              lineHeight: "1.7",
            })}
          >
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
        </RetroBox.Content>
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
        ) : isLoadingNodes ? (
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
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    })}
                  >
                    <div
                      className={css({ fontSize: "12px", color: "#b48512" })}
                    >
                      ID: {node.nodeId}
                    </div>
                    <button
                      onClick={() => handleRefreshNode(node.nodeId)}
                      className={css({
                        fontSize: "11px",
                        px: "8px",
                        py: "2px",
                        bg: "white",
                        border: "1px solid #ffaa00",
                        borderRadius: "4px",
                        color: "#ff7700",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        _hover: {
                          bg: "#fff9f0",
                        },
                      })}
                    >
                      ↻
                    </button>
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
                      {(node.rewardsLive ?? 0).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      $Pecky
                    </strong>
                  </div>
                  <button
                    onClick={() => handleClaimRewards(node.nodeId)}
                    disabled={
                      !(node.rewardsLive && node.rewardsLive > 0) ||
                      isClaimingRewards
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
                        !(node.rewardsLive && node.rewardsLive > 0) ||
                        isClaimingRewards
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        !(node.rewardsLive && node.rewardsLive > 0) ||
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
            It seems you don't own a node yet!
            <br />
            Get your own at{" "}
            <a
              href="https://crystara.trade/trade/peckynode"
              target="_blank"
              rel="noopener noreferrer"
              className={css({
                color: "#ff7700",
                fontWeight: "600",
                textDecoration: "underline",
                _hover: {
                  color: "#ffaa00",
                },
              })}
            >
              Crystara
            </a>
          </div>
        )}
      </RetroBox>
    </>
  );
}
