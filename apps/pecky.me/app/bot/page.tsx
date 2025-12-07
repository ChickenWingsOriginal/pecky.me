"use client";

import { css } from "@/styled-system/css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { RetroBox } from "@/app/components/RetroBox";
import { EXTERNAL_LINKS } from "@/app/constants/links";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { toast } from "sonner";

const PECKY_COIN_MODULE =
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

export default function BotPage() {
  const { state, refreshBalances } = useWallet();
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

    try {
      const response = await fetch(
        "https://rpc-mainnet.supra.com/rpc/v1/view",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            function: `${PECKY_COIN_MODULE}::PeckyBotV2::is_peckybot_active`,
            arguments: [connectedWallet.walletAddress],
            type_arguments: [],
          }),
        },
      );

      const data = await response.json();
      const isActive = data?.result?.[0] === true;
      setBotActive(isActive);

      if (isActive) {
        getDaysRemaining();
      }
    } catch (error) {
      console.error("Failed to check bot status:", error);
    }
  };

  const getDaysRemaining = async () => {
    if (!connectedWallet?.walletAddress) return;

    try {
      const response = await fetch(
        "https://rpc-mainnet.supra.com/rpc/v1/view",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            function: `${PECKY_COIN_MODULE}::PeckyBotV2::get_remaining_days`,
            arguments: [connectedWallet.walletAddress],
            type_arguments: [],
          }),
        },
      );

      const data = await response.json();
      const days = data?.result?.[0] || 0;
      setDaysLeft(days);
    } catch (error) {
      console.error("Failed to get days remaining:", error);
    }
  };

  const getFailureReason = async (txHash: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://rpc-mainnet.supra.com/rpc/v1/transactions/${txHash}`,
      );
      const data = await response.json();
      const status = data?.output?.Move?.vm_status;

      if (status?.includes("0x7d0")) {
        return "You're already activated – no need to pay twice.";
      } else if (status?.includes("0x7d1")) {
        return "Please enter a positive number of days.";
      } else if (status?.includes("0x7d2")) {
        return "You can't extend a bot that isn't active. Activate it first!";
      } else if (status?.includes("0x7d3")) {
        return "Your grace period has expired – reactivate with Supra first.";
      } else if (status?.includes("0x3e7")) {
        return "You need to register first.";
      } else {
        return "Transaction failed. Reason unknown.";
      }
    } catch {
      return "Transaction failed.";
    }
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
        throw new Error(result.error || result.reason || "Activation failed");
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
        const failureMsg = await getFailureReason(result.txHash || "");
        toast.error(failureMsg);
      }
    } catch (error) {
      console.error("Activation failed:", error);
      toast.error("Failed to activate bot");
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
        throw new Error(result.error || result.reason || "Extension failed");
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
        const failureMsg = await getFailureReason(result.txHash || "");
        toast.error(failureMsg);
      }
    } catch (error) {
      console.error("Extension failed:", error);
      toast.error("Failed to extend bot");
    } finally {
      setIsExtending(false);
    }
  };

  const getBotStatus = () => {
    if (!connectedWallet?.walletAddress) {
      return "connect wallet";
    }
    if (botActive) {
      return `✅ ACTIVE - ${daysLeft} days left`;
    }
    return "❌ inactive";
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
      <div
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
          <div className={css({ textAlign: "center", mb: "16px" })}>
            <div className={css({ mb: "12px" })}>
              <Image
                src="/images/bot-icon.png"
                alt="Bot Icon"
                width={100}
                height={108}
                style={{ margin: "0 auto", marginBottom: "12px" }}
              />
            </div>
            <h1
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#ff9000",
                mb: "12px",
              })}
            >
              PECKYBOT on Discord
            </h1>
          </div>

          <div className={css({ mb: "14px" })}>
            <div
              className={css({
                fontSize: "14px",
                fontWeight: "600",
                color: "#2e2e2e",
                mb: "10px",
              })}
            >
              Get exclusive bot access:
            </div>
            <ul
              className={css({
                fontSize: "13px",
                color: "#b48512",
                pl: "20px",
                lineHeight: "1.8",
                m: "0",
                mb: "12px",
              })}
            >
              <li>Get notifications when someone bids on your NFT</li>
              <li>
                Set alerts for any top 25 NFT on Crystara with your rarity,
                below your chosen price
              </li>
              <li>...and more features soon!</li>
            </ul>
          </div>

          <div
            className={css({ fontSize: "14px", color: "#a06500", mb: "8px" })}
          >
            Pay{" "}
            <span className={css({ fontWeight: "700" })}>
              one time 5,000 $SUPRA
            </span>{" "}
            to activate the bot.
            <br />
            After that, you only need Pecky as gas to keep the bot active.
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: "#ed7a00",
              fontWeight: "600",
            })}
          >
            All $Pecky used for the bot will be burned.
          </div>
        </RetroBox>
      </div>

      <div className={css({ w: "100%", mt: "4px", px: "5%" })}>
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
            <span className={css({ color: "#2e2e2e" })}>{getBotStatus()}</span>
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
                src="/images/Discord-pecky.png"
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
      </div>
    </div>
  );
}
