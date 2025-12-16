"use client";

import { css } from "@/styled-system/css";
import { RetroBox } from "@/app/components/RetroBox";

interface NodeWithData {
  nodeId: string;
  name: string;
  rewards?: number;
  rewardsLive?: number;
  apy?: number;
}

interface PeckyNodeStakingProps {
  allNodes: NodeWithData[];
  ownedNodes: NodeWithData[];
  isLoading: boolean;
  peckyBalance: bigint;
  walletAddress: string | null;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  isStaking: boolean;
  handleStake: () => void;
}

export function PeckyNodeStaking({
  allNodes,
  ownedNodes,
  isLoading,
  peckyBalance,
  walletAddress,
  selectedNodeId,
  setSelectedNodeId,
  stakeAmount,
  setStakeAmount,
  isStaking,
  handleStake,
}: PeckyNodeStakingProps) {
  const setPercentage = (percent: number) => {
    const balance = Number(peckyBalance) / 1_000_000;
    const amount = (balance * percent) / 100;
    setStakeAmount(amount.toString());
  };

  return (
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
          Stake $Pecky on a Node
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

      <div
        className={css({
          bg: "#fffbe8",
          p: "16px",
          borderRadius: "12px",
          mb: "20px",
          border: "1px solid #ffae00",
        })}
      >
        <h3
          className={css({
            fontSize: "16px",
            fontWeight: "700",
            color: "#a06500",
            mb: "12px",
            textAlign: "center",
          })}
        >
          Staking – The Pecky Way
        </h3>
        <ul
          className={css({
            fontSize: "13px",
            color: "#b48512",
            lineHeight: "1.8",
            pl: "20px",
            m: "0",
          })}
        >
          <li>
            Stake your $PECKY on a node of your choice and let those golden eggs
            grow <span className={css({ fontWeight: "700" })}>(≈ 8% APY)</span>
          </li>
          <li>
            You can unstake anytime — but your chicks need{" "}
            <span className={css({ fontWeight: "700" })}>2 days to hatch</span>{" "}
            before you can claim
          </li>
          <li>
            Claim your rewards regularly{" "}
            <span className={css({ fontWeight: "700" })}>(&lt; 30 days)</span>{" "}
            to keep Pecky's magic growing
          </li>
        </ul>
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
              gridTemplateColumns: {
                base: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: "10px",
              mb: "20px",
              pb: "20px",
              borderBottom: "2px dashed #ffd36e",
            })}
          >
            {allNodes.map((node) => {
              const isOwned = ownedNodes.some(
                (owned) => owned.nodeId === node.nodeId,
              );
              return (
                <div
                  key={node.nodeId}
                  onClick={() => setSelectedNodeId(node.nodeId)}
                  className={css({
                    p: "14px",
                    bg: selectedNodeId === node.nodeId ? "#fff8e8" : "#fffbe8",
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
                      })}
                    >
                      {node.name}
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

            {selectedNodeId && (
              <div
                className={css({
                  position: "relative",
                  w: "100%",
                  maxW: "300px",
                  mx: "auto",
                  borderRadius: "8px",
                  overflow: "hidden",
                })}
              >
                <img
                  src={`https://smartnft.pecky.me/animation/pecky-node/${selectedNodeId}.gif?cb=${Math.floor(Date.now() / (15 * 60 * 1000)) * (15 * 60 * 1000)}`}
                  alt={allNodes.find((n) => n.nodeId === selectedNodeId)?.name}
                  loading="lazy"
                  className={css({
                    w: "100%",
                    objectFit: "cover",
                  })}
                />
              </div>
            )}

            {walletAddress && (
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
                {(Number(peckyBalance) / 1_000_000).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
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
  );
}
