"use client";

import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// @ts-ignore
import { BCS, HexString } from "supra-l1-sdk";
import { formatSupraBalance } from "@/app/utils/formatSupraBalance";
import { formatCountdownTime } from "@/app/utils/formatCountdownTime";
import { calculateMaxStakeAmount } from "@/app/utils/calculateMaxStakeAmount";
import { RetroBox } from "./RetroBox";
import { useTranslations } from "next-intl";

const SUPRA_DECIMALS = 8;
const MERIDIAN_POOL =
  "0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331";
const PECKY_COIN_MODULE =
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

export function MeridianStaking() {
  const t = useTranslations('staking.meridian');
  const { state, refreshBalances, refreshStakingInfo } = useWallet();
  const { sendTransaction } = useSupraConnect();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState("");

  const walletAddress = state.walletAddress;
  const nextClaimTime = state.staking.meridian.nextClaimTime;

  useEffect(() => {
    if (!nextClaimTime) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsUntilClaim = nextClaimTime - now;
      setTimeUntilClaim(formatCountdownTime(secondsUntilClaim));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [nextClaimTime]);

  const handleMaxClick = () => {
    const amount = calculateMaxStakeAmount(state.supraBalance);
    setStakeAmount(amount);
  };

  const handleStake = async () => {
    console.log("handleStake called, walletAddress:", walletAddress);

    if (!walletAddress) {
      console.log("No wallet address");
      toast.error(t('connectWallet'));
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      console.log("Invalid amount:", stakeAmount);
      toast.error(t('enterAmount'));
      return;
    }

    setIsStaking(true);
    try {
      const amountInMicroSupra = BigInt(
        Math.floor(parseFloat(stakeAmount) * Math.pow(10, SUPRA_DECIMALS)),
      );

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

      toast.success(t('stakingSuccess') + result.txHash);
      setStakeAmount("");

      setTimeout(() => {
        refreshStakingInfo();
      }, 2000);
    } catch (error) {
      console.error("Staking failed:", error);
      toast.error(error instanceof Error ? error.message : t('stakingFailed'));
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error(t('connectWallet'));
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

      toast.success(t('claimSuccess') + result.txHash);

      setTimeout(async () => {
        await refreshBalances();
        refreshStakingInfo();
      }, 2000);
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error(error instanceof Error ? error.message : t('claimFailed'));
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <RetroBox startOpen={true}>
      <RetroBox.Title>{t('title')}</RetroBox.Title>
      <RetroBox.Content>
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
              {t('benefit1')}{" "}
              <span className={css({ fontWeight: "700" })}>{t('benefit1Apy')}</span>
            </li>
            <li>
              {t('benefit2')}{" "}
              <span className={css({ fontWeight: "700" })}>
                {t('benefit2Amount')}
              </span>
            </li>
            <li>
              <span className={css({ fontWeight: "700" })}>
                {t('benefit3')}
              </span>
            </li>
            <li>{t('benefit4')}</li>
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
              {t('supraBalance')}
            </div>
            <div
              className={css({
                fontSize: "18px",
                fontWeight: "700",
                color: "#ff7700",
              })}
            >
              {state.staking.isLoading
                ? "..."
                : formatSupraBalance(state.supraBalance)}
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
              {t('staked')}
            </div>
            <div
              className={css({
                fontSize: "18px",
                fontWeight: "700",
                color: "#ff7700",
              })}
            >
              {state.staking.isLoading
                ? "..."
                : formatSupraBalance(state.staking.meridian.stakedAmount)}
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
            {t('maxButton')}
          </button>
        </div>

        <div
          className={flex({
            flexDir: "column",
            gap: "12px",
            mb: "20px",
          })}
        >
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
            {isStaking ? t('staking') : t('stakingButton')}
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
              {isClaiming ? t('claiming') : t('claimButton')}
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
            {t('airdropVault')}
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
            className={css({
              fontSize: "11px",
              color: "#b48512",
              mt: "6px",
            })}
          >
            {t('peckyLeft')}
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
            {t('earningExplain1')}{" "}
            <span className={css({ fontWeight: "700" })}>{t('earningExplain2')}</span> {t('earningExplain3')}
          </div>
          <div>{t('earningExample')}</div>
          <div className={css({ mt: "8px", fontSize: "11px" })}>
            {t('vaultDisclaimer')}
          </div>
        </div>
      </RetroBox.Content>
    </RetroBox>
  );
}
