"use client";

import { css } from "@/styled-system/css";
import { useState, useEffect } from "react";
import { RetroBox } from "@/app/components/RetroBox";
import { EXTERNAL_LINKS } from "@/app/constants/links";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { toast } from "sonner";
import { checkPeckyBotStatus } from "@/app/utils/checkPeckyBotStatus";
import { getPeckyBotDaysRemaining } from "@/app/utils/getPeckyBotDaysRemaining";
import { getBotTransactionFailureReason } from "@/app/utils/getBotTransactionFailureReason";
import { formatBotStatus } from "@/app/utils/formatBotStatus";
import { PECKY_COIN_MODULE } from "@/app/utils/constants";

export function BotClient() {
  const { refreshBalances } = useWallet();
  const { sendTransaction, connectedWallet } = useSupraConnect();
  const [extendDays, setExtendDays] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [botActive, setBotActive] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (connectedWallet?.walletAddress) {
      checkBotStatus();
    } else {
      setBotActive(false);
      setDaysLeft(0);
    }
  }, [connectedWallet?.walletAddress]);

  useEffect(() => {
    const days = parseInt(extendDays, 10);
    if (days > 0) {
      setEstimatedCost(days * 300_000);
    } else {
      setEstimatedCost(0);
    }
  }, [extendDays]);

  const checkBotStatus = async () => {
    if (!connectedWallet?.walletAddress) return;

    const isActive = await checkPeckyBotStatus(connectedWallet.walletAddress);
    setBotActive(isActive);

    if (isActive) {
      getDaysRemaining();
    }
  };

  const getDaysRemaining = async () => {
    if (!connectedWallet?.walletAddress) return;

    const days = await getPeckyBotDaysRemaining(connectedWallet.walletAddress);
    setDaysLeft(days);
  };

  const handleActivateBot = async () => {
    if (!connectedWallet?.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsActivating(true);
    try {
      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: "PeckyBotV2",
          functionName: "activate_peckybot_with_supra",
          typeArguments: [],
          arguments: [],
        },
      });

      if (!result.success) {
        const errorMsg = result.error || result.reason || "Transaction failed";
        toast.error(`Failed to activate bot: ${errorMsg}`);
        return;
      }

      toast.success("Waiting for transaction confirmation...");

      let isActive = false;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 4000));
        await checkBotStatus();
        if (botActive) {
          isActive = true;
          break;
        }
      }

      if (isActive) {
        toast.success("PeckyBot activated with Supra!");
      } else {
        const failureMsg = await getBotTransactionFailureReason(
          result.txHash || "",
        );
        toast.error(failureMsg);
      }
    } catch (error) {
      console.error("Activation failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to activate bot: ${errorMsg}`);
    } finally {
      setIsActivating(false);
    }
  };

  const handleExtendBot = async () => {
    if (!connectedWallet?.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!extendDays || parseInt(extendDays) <= 0) {
      toast.error("Please enter a valid number of days");
      return;
    }

    setIsExtending(true);
    try {
      const previousDays = daysLeft;

      const days = BigInt(extendDays);
      const arr = new ArrayBuffer(8);
      const view = new DataView(arr);
      view.setBigUint64(0, days, true);
      const daysArg = Array.from(new Uint8Array(arr));

      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: "PeckyBotV2",
          functionName: "extend_peckybot_with_pecky",
          typeArguments: [],
          arguments: [daysArg],
        },
      });

      if (!result.success) {
        const errorMsg = result.error || result.reason || "Transaction failed";
        toast.error(`Failed to extend bot: ${errorMsg}`);
        return;
      }

      toast.success("Waiting for transaction confirmation...");

      let success = false;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 4000));
        await getDaysRemaining();
        if (daysLeft > previousDays) {
          success = true;
          break;
        }
      }

      if (success) {
        toast.success(`PeckyBot extended for ${extendDays} day(s)!`);
        setExtendDays("");
        await refreshBalances();
      } else {
        const failureMsg = await getBotTransactionFailureReason(
          result.txHash || "",
        );
        toast.error(failureMsg);
      }
    } catch (error) {
      console.error("Extension failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to extend bot: ${errorMsg}`);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <RetroBox>
      <button
        onClick={handleActivateBot}
        disabled={isActivating || !connectedWallet?.walletAddress}
        className={css({
          w: "100%",
          p: "14px 20px",
          bg:
            isActivating || !connectedWallet?.walletAddress
              ? "#cccccc"
              : "linear-gradient(to right, #ffaa00, #ff7700)",
          color: "white",
          borderRadius: "12px",
          border: "none",
          fontSize: "15px",
          fontWeight: "600",
          cursor:
            isActivating || !connectedWallet?.walletAddress
              ? "not-allowed"
              : "pointer",
          transition: "transform 0.1s",
          mb: "12px",
          _hover:
            isActivating || !connectedWallet?.walletAddress
              ? {}
              : { transform: "scale(1.02)" },
        })}
      >
        {isActivating ? "Activating..." : "Activate PECKYBOT with Supra"}
      </button>
      <div
        className={css({
          fontWeight: "600",
          color: "#ff9000",
          fontSize: "13px",
          mb: "16px",
        })}
      >
        Bot status:{" "}
        <span className={css({ color: "#2e2e2e" })}>
          {formatBotStatus(
            !!connectedWallet?.walletAddress,
            botActive,
            daysLeft,
          )}
        </span>
      </div>

      <hr
        style={{
          margin: "12px 0",
          borderTop: "1.5px dashed #ffd36e",
          opacity: 0.6,
        }}
      />

      <div className={css({ mb: "14px", mt: "16px" })}>
        <label
          className={css({
            fontSize: "13px",
            color: "#a06500",
            fontWeight: "600",
            display: "block",
            mb: "8px",
          })}
        >
          Extend with Pecky tokens:
        </label>
        <div
          className={css({
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "stretch",
          })}
        >
          <input
            type="number"
            min="1"
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            placeholder="How many days?"
            className={css({
              flex: "2",
              minW: "120px",
              maxW: "220px",
              p: "8px 10px",
              borderRadius: "11px",
              border: "1.5px solid #ffae00",
              fontSize: "13px",
              height: "38px",
              boxSizing: "border-box",
              bg: "white",
            })}
          />
          <button
            onClick={handleExtendBot}
            disabled={isExtending || !connectedWallet?.walletAddress}
            className={css({
              flex: "1",
              minW: "90px",
              maxW: "150px",
              height: "38px",
              fontSize: "13px",
              p: "0 12px",
              bg:
                isExtending || !connectedWallet?.walletAddress
                  ? "#cccccc"
                  : "linear-gradient(to right, #ffaa00, #ff7700)",
              color: "white",
              border: "none",
              borderRadius: "11px",
              fontWeight: "600",
              cursor:
                isExtending || !connectedWallet?.walletAddress
                  ? "not-allowed"
                  : "pointer",
              transition: "transform 0.1s",
              _hover:
                isExtending || !connectedWallet?.walletAddress
                  ? {}
                  : { transform: "scale(1.02)" },
            })}
          >
            {isExtending ? "Extending..." : "Extend with Pecky"}
          </button>
        </div>
      </div>
      <div
        className={css({
          fontSize: "13px",
          color: "#ff9000",
          fontWeight: "500",
          textAlign: "center",
          mb: "8px",
        })}
      >
        {estimatedCost > 0 &&
          `You will pay ${estimatedCost.toLocaleString()} Pecky`}
      </div>
      <div
        className={css({
          fontSize: "15px",
          color: "#29cf41",
          fontWeight: "600",
          textAlign: "center",
          mb: "16px",
        })}
      >
        {botActive && `${daysLeft} days left active`}
      </div>

      <hr
        style={{
          margin: "12px 0",
          borderTop: "1.5px dashed #ffd36e",
          opacity: 0.6,
        }}
      />

      <div
        className={css({
          fontSize: "13px",
          color: "#888",
          textAlign: "center",
          lineHeight: "1.8",
          mt: "16px",
          mb: "16px",
        })}
      >
        <div className={css({ mb: "8px" })}>
          300,000 Pecky = 1 day bot activation.
        </div>
        <div className={css({ mb: "8px" })}>
          Use the bot as long as you keep extending!
        </div>
        <div>Need help? Ask in Discord!</div>
      </div>

      <hr
        style={{
          margin: "12px 0",
          borderTop: "1.5px dashed #ffd36e",
          opacity: 0.6,
        }}
      />

      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          alignItems: "center",
          mt: "16px",
        })}
      >
        <a
          href={EXTERNAL_LINKS.discord}
          target="_blank"
          rel="noopener noreferrer"
          title="Join Discord"
        >
          <img
            src="/images/discord-pecky.png"
            alt="Discord"
            style={{ height: "42px" }}
          />
        </a>
        <a
          href={EXTERNAL_LINKS.crystara}
          target="_blank"
          rel="noopener noreferrer"
          title="Trade on Crystara"
        >
          <img
            src="/images/crystara.png"
            alt="Crystara"
            style={{ height: "36px" }}
          />
        </a>
      </div>
    </RetroBox>
  );
}
