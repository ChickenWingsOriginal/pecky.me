"use client";

import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { RetroBox } from "@/app/components/RetroBox";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// @ts-ignore
import { BCS, HexString } from "supra-l1-sdk";
import Image from "next/image";

const SUPRA_DECIMALS = 8;
const MERIDIAN_POOL =
  "0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331";
const PECKY_COIN_MODULE =
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const STAKING_CLAIM_TABLE =
  "0x68ff22fd7edc5d53bb61af22aa979170286489af715fbab3d080ed57df6717a4";

function formatBalance(balance: bigint | null): string {
  if (!balance) return "0";
  const balanceNumber = Number(balance) / Math.pow(10, SUPRA_DECIMALS);
  return balanceNumber.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function StakingPage() {
  const { state, dispatch, refreshBalances } = useWallet();
  const { sendTransaction, connectedWallet } = useSupraConnect();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState<number | null>(null);
  const [timeUntilClaim, setTimeUntilClaim] = useState("");

  const walletAddress = connectedWallet?.walletAddress;

  useEffect(() => {
    if (walletAddress) {
      fetchStakingData();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!nextClaimTime) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsUntilClaim = nextClaimTime - now;

      if (secondsUntilClaim <= 0) {
        setTimeUntilClaim("");
        return;
      }

      const hours = Math.floor(secondsUntilClaim / 3600);
      const minutes = Math.floor((secondsUntilClaim % 3600) / 60);
      setTimeUntilClaim(`next claim in ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [nextClaimTime]);

  const fetchNextClaimTime = async () => {
    if (!walletAddress) return;
    try {
      const response = await fetch(
        `https://rpc-mainnet.supra.com/rpc/v1/tables/${STAKING_CLAIM_TABLE}/item`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key_type: "address",
            value_type: "u64",
            key: walletAddress,
          }),
        },
      );
      const data = await response.json();
      console.log("Next claim time response:", data);
      if (data && !isNaN(Number(data))) {
        const lastClaimTimeSeconds = Number(data);
        const nextClaimTimeSeconds = lastClaimTimeSeconds + 86400;
        console.log(
          "Last claim time:",
          lastClaimTimeSeconds,
          "Next claim time:",
          nextClaimTimeSeconds,
        );
        setNextClaimTime(nextClaimTimeSeconds);
      }
    } catch (error) {
      console.error("Failed to fetch next claim time:", error);
    }
  };

  const fetchStakingData = async () => {
    if (!walletAddress) return;
    try {
      const response = await fetch(
        "https://rpc-mainnet.supra.com/rpc/v1/view",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            function: "0x1::pbo_delegation_pool::get_stake",
            type_arguments: [],
            arguments: [MERIDIAN_POOL, walletAddress],
          }),
        },
      );
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const stakedAmount = BigInt(data.result[0]);
        dispatch({
          type: "SET_STAKING_INFO",
          payload: { stakedAmount },
        });
      }
      await fetchNextClaimTime();
    } catch (error) {
      console.error("Failed to fetch staking data:", error);
    }
  };

  const handleMaxClick = () => {
    if (state.supraBalance) {
      // Use all balance minus 1 SUPRA for gas fees
      const gasFeeMicroSupra = BigInt(Math.pow(10, SUPRA_DECIMALS)); // 1 SUPRA
      const balanceAfterGas = state.supraBalance - gasFeeMicroSupra;
      const balanceNumber =
        Number(balanceAfterGas > BigInt(0) ? balanceAfterGas : BigInt(0)) /
        Math.pow(10, SUPRA_DECIMALS);
      setStakeAmount(balanceNumber.toString());
    }
  };

  const handleStake = async () => {
    console.log("handleStake called, walletAddress:", walletAddress);

    if (!walletAddress) {
      console.log("No wallet address");
      toast.error("Please connect your wallet first");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      console.log("Invalid amount:", stakeAmount);
      toast.error("Please enter a valid amount");
      return;
    }

    setIsStaking(true);
    try {
      const amountInMicroSupra = BigInt(
        Math.floor(parseFloat(stakeAmount) * Math.pow(10, SUPRA_DECIMALS)),
      );

      // BCS serialize the arguments
      const poolAddressBytes = new HexString(MERIDIAN_POOL).toUint8Array();
      const amountBytes = BCS.bcsSerializeUint64(amountInMicroSupra);

      console.log("About to call sendTransaction with BCS-serialized args:", {
        poolAddress: Array.from(poolAddressBytes),
        amount: Array.from(amountBytes),
      });

      const result = await sendTransaction({
        payload: {
          moduleAddress: "0x1",
          moduleName: "pbo_delegation_pool",
          functionName: "add_stake",
          typeArguments: [],
          arguments: [poolAddressBytes, amountBytes],
        },
      });

      console.log("sendTransaction returned:", JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.error || result.reason || "Transaction failed");
      }

      toast.success("Staking transaction submitted! Hash: " + result.txHash);
      setStakeAmount("");

      setTimeout(() => {
        fetchStakingData();
        fetchNextClaimTime();
      }, 2000);
    } catch (error) {
      console.error("Staking failed:", error);
      toast.error(error instanceof Error ? error.message : "Staking failed");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsClaiming(true);
    try {
      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: "Coin",
          functionName: "claim_from_airdrop_vault_staking",
          typeArguments: [],
          arguments: [],
        },
      });

      console.log("Claim transaction result:", JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(
          result.error || result.reason || "Claim transaction failed",
        );
      }

      toast.success("Claim transaction submitted! Hash: " + result.txHash);

      setTimeout(async () => {
        await refreshBalances();
        fetchStakingData();
        fetchNextClaimTime();
      }, 2000);
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error(error instanceof Error ? error.message : "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (state.isConnected && state.walletAddress) {
      fetchStakingData();
    }
  }, [state.isConnected, state.walletAddress]);

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
              src="/images/staking-icon.png"
              alt="Staking icon"
              width={96}
              height={96}
            />
            <h2
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#a06500",
              })}
            >
              Stake $Supra on the Meridian Node
            </h2>
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
                Stake your Supra and earn{" "}
                <span className={css({ fontWeight: "700" })}>8% APY</span>
              </li>
              <li>
                Get daily $Pecky –{" "}
                <span className={css({ fontWeight: "700" })}>
                  1 $Pecky per staked Supra, every day
                </span>
              </li>
              <li>
                <span className={css({ fontWeight: "700" })}>
                  50% of the node's profit is used to buy & burn $Pecky!
                </span>
              </li>
              <li>No chicken left behind 🐔</li>
            </ul>
          </div>

          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              mb: "20px",
            })}
          >
            <div
              className={css({
                bg: "#fffbe8",
                p: "12px",
                borderRadius: "10px",
                border: "1px solid #ffae00",
                textAlign: "center",
              })}
            >
              <div
                className={css({
                  fontSize: "11px",
                  color: "#a06500",
                  mb: "4px",
                })}
              >
                SUPRA Balance
              </div>
              <div
                className={css({
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#ff7700",
                })}
              >
                {state.isLoadingStaking
                  ? "..."
                  : formatBalance(state.supraBalance)}
              </div>
            </div>
            <div
              className={css({
                bg: "#fffbe8",
                p: "12px",
                borderRadius: "10px",
                border: "1px solid #ffae00",
                textAlign: "center",
              })}
            >
              <div
                className={css({
                  fontSize: "11px",
                  color: "#a06500",
                  mb: "4px",
                })}
              >
                Staked
              </div>
              <div
                className={css({
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#ff7700",
                })}
              >
                {state.isLoadingStaking
                  ? "..."
                  : formatBalance(state.stakedAmount)}
              </div>
            </div>
          </div>

          <div className={flex({ gap: "8px", mb: "20px" })}>
            <input
              type="number"
              placeholder="0.000"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className={css({
                flex: "1",
                px: "12px",
                py: "10px",
                borderRadius: "10px",
                border: "1.5px solid #ffae00",
                fontSize: "14px",
                bg: "#fff",
              })}
            />
            <button
              onClick={handleMaxClick}
              disabled={!state.supraBalance || state.supraBalance === BigInt(0)}
              className={css({
                px: "16px",
                py: "10px",
                borderRadius: "10px",
                bg:
                  state.supraBalance && state.supraBalance > BigInt(0)
                    ? "white"
                    : "#f0f0f0",
                border: "1.5px solid #ffae00",
                color:
                  state.supraBalance && state.supraBalance > BigInt(0)
                    ? "#ff7700"
                    : "#ccc",
                fontSize: "13px",
                fontWeight: "600",
                cursor:
                  state.supraBalance && state.supraBalance > BigInt(0)
                    ? "pointer"
                    : "not-allowed",
                transition: "transform 0.1s",
                _hover:
                  state.supraBalance && state.supraBalance > BigInt(0)
                    ? { transform: "scale(1.05)" }
                    : {},
              })}
            >
              MAX
            </button>
          </div>

          <div className={flex({ flexDir: "column", gap: "12px", mb: "20px" })}>
            <button
              onClick={handleStake}
              disabled={isStaking || !walletAddress || !stakeAmount}
              className={css({
                bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                color: "white",
                py: "14px",
                px: "20px",
                borderRadius: "12px",
                border: "none",
                fontSize: "15px",
                fontWeight: "600",
                cursor:
                  isStaking || !walletAddress || !stakeAmount
                    ? "not-allowed"
                    : "pointer",
                transition: "transform 0.1s",
                opacity:
                  isStaking || !walletAddress || !stakeAmount ? "0.6" : "1",
                _hover:
                  isStaking || !walletAddress || !stakeAmount
                    ? {}
                    : { transform: "scale(1.03)" },
              })}
            >
              {isStaking ? "Staking..." : "Stake on Meridian"}
            </button>
            <div
              className={css({
                display: "flex",
                flexDir: "column",
                gap: "4px",
              })}
            >
              <button
                onClick={handleClaim}
                disabled={isClaiming || !walletAddress || timeUntilClaim !== ""}
                className={css({
                  bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                  color: "white",
                  py: "14px",
                  px: "20px",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor:
                    isClaiming || !walletAddress || timeUntilClaim !== ""
                      ? "not-allowed"
                      : "pointer",
                  transition: "transform 0.1s",
                  opacity:
                    isClaiming || !walletAddress || timeUntilClaim !== ""
                      ? "0.6"
                      : "1",
                  _hover:
                    isClaiming || !walletAddress || timeUntilClaim !== ""
                      ? {}
                      : { transform: "scale(1.03)" },
                })}
              >
                {isClaiming ? "Claiming..." : "Claim Meridian Reward"}
              </button>
              {timeUntilClaim && (
                <div
                  className={css({
                    fontSize: "12px",
                    color: "#b48512",
                    textAlign: "center",
                  })}
                >
                  {timeUntilClaim}
                </div>
              )}
            </div>
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
            <div
              className={css({
                fontSize: "12px",
                fontWeight: "600",
                color: "#a06500",
                mb: "8px",
              })}
            >
              Airdrop Vault
            </div>
            <div
              className={css({
                w: "100%",
                h: "20px",
                bg: "#e8e8e8",
                borderRadius: "10px",
                overflow: "hidden",
              })}
            >
              <div
                className={css({
                  h: "100%",
                  w: "48%",
                  bg: "linear-gradient(to right, #ffaa00, #ff7700)",
                })}
              />
            </div>
            <div
              className={css({ fontSize: "11px", color: "#b48512", mt: "6px" })}
            >
              ~48,801,667,994 $Pecky left for grab
            </div>
          </div>

          <div
            className={css({
              fontSize: "12px",
              color: "#888",
              textAlign: "center",
              lineHeight: "1.8",
            })}
          >
            <div>
              Each staked Supra earns{" "}
              <span className={css({ fontWeight: "700" })}>1 $Pecky</span> per
              day
            </div>
            <div>Ex: 500,000 staked → 500,000 $Pecky / 24h</div>
            <div className={css({ mt: "8px", fontSize: "11px" })}>
              As long as the airdrop vault still has $Pecky left.
            </div>
          </div>
        </RetroBox>
      </main>
    </div>
  );
}
