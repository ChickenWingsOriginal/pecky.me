"use client";

import { css } from "@/styled-system/css";
import { formatCountdownFromTimestamp } from "@/app/utils/formatCountdownFromTimestamp";
import { formatTimestamp } from "@/app/utils/formatTimestamp";
import type { PendingUnstake } from "@/app/utils/nodeService";
import type { UserStakeInfo } from "@/app/utils/nodeService";
import { RetroBox } from "@/app/components/RetroBox";

interface PeckyNodeUnstakingProps {
  pendingUnstakes: PendingUnstake[];
  userStakedNodes: UserStakeInfo[];
  unstakeAmounts: Record<string, string>;
  setUnstakeAmounts: (amounts: Record<string, string>) => void;
  isClaimingUnstakes: boolean;
  unstakingNodeId: string | null;
  claimingUserRewardNodeId: string | null;
  handleClaimUnstakes: () => void;
  handleUnstake: (nodeId: string) => void;
  handleClaimUserReward: (nodeId: string) => void;
}

export function PeckyNodeUnstaking({
  pendingUnstakes,
  userStakedNodes,
  unstakeAmounts,
  setUnstakeAmounts,
  isClaimingUnstakes,
  unstakingNodeId,
  claimingUserRewardNodeId,
  handleClaimUnstakes,
  handleUnstake,
  handleClaimUserReward,
}: PeckyNodeUnstakingProps) {
  return (
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
              isClaimingUnstakes || !pendingUnstakes.some((u) => u.claimable)
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
                isClaimingUnstakes || !pendingUnstakes.some((u) => u.claimable)
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isClaimingUnstakes || !pendingUnstakes.some((u) => u.claimable)
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
                        {(Number(stakedAmount) / 1_000_000).toLocaleString()}{" "}
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
  );
}
