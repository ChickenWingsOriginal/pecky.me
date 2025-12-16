'use client';

import { css } from "@/styled-system/css";
import { useState, type KeyboardEvent } from "react";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { RetroBox } from "./RetroBox";
import { toast } from "sonner";
import { PECKY_COIN_MODULE } from "@/app/utils/constants";
// @ts-ignore - supra-l1-sdk doesn't have TypeScript definitions
import { BCS } from "supra-l1-sdk";

export function DiscordLinking() {
  const { state, refreshDiscordStatus } = useWallet();
  const { connectedWallet, sendTransaction } = useSupraConnect();
  const [discordInput, setDiscordInput] = useState("");
  const [linkingDiscord, setLinkingDiscord] = useState(false);

  const handleLinkDiscord = async () => {
    if (!connectedWallet?.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    const idStr = discordInput.trim();
    if (!idStr) {
      toast.error("Please enter a Discord ID");
      return;
    }

    // Validate Discord ID format (16-20 digits)
    if (!/^\d{16,20}$/.test(idStr)) {
      toast.error("Please enter a valid Discord ID (16-20 digits)");
      return;
    }

    setLinkingDiscord(true);
    try {
      // Serialize Discord ID as u128
      const serializedDiscordId = BCS.bcsSerializeU128(idStr);

      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: 'discord_link',
          functionName: 'register_discord',
          typeArguments: [],
          arguments: [serializedDiscordId],
        },
      });

      if (!result.success) {
        const errorMsg = result.error || result.reason || "Transaction failed";
        toast.error(`Failed to link Discord: ${errorMsg}`);
        return;
      }

      toast.success("Discord linked successfully!");
      setDiscordInput("");

      // Refresh Discord status to update UI
      await refreshDiscordStatus();
    } catch (error) {
      console.error("Discord linking failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to link Discord: ${errorMsg}`);
    } finally {
      setLinkingDiscord(false);
    }
  };

  const handleUnlinkDiscord = async () => {
    if (!connectedWallet?.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLinkingDiscord(true);
    try {
      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: 'discord_link',
          functionName: 'unregister_discord',
          typeArguments: [],
          arguments: [],
        },
      });

      if (!result.success) {
        const errorMsg = result.error || result.reason || "Transaction failed";
        toast.error(`Failed to unlink Discord: ${errorMsg}`);
        return;
      }

      toast.success("Discord unlinked successfully!");

      // Refresh Discord status to update UI
      await refreshDiscordStatus();
    } catch (error) {
      console.error("Discord unlinking failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to unlink Discord: ${errorMsg}`);
    } finally {
      setLinkingDiscord(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !linkingDiscord && state.isConnected) {
      void handleLinkDiscord();
    }
  };

  return (
    <RetroBox>
      <div className={css({ fontSize: "18px", fontWeight: "700", color: "#4a2c00", mb: "8px", textAlign: "center" })}>
        Link your Discord to Pecky
      </div>
      <div className={css({ fontSize: "14px", color: "#513d0a", mb: "16px", textAlign: "center" })}>
        Join the leaderboard, earn Discord roles & get future perks — all tied to your wallet.
      </div>

      {state.isConnected && state.isDiscordLinked ? (
        // Discord is linked
        <div className={css({ display: "flex", flexDir: "column", gap: "12px" })}>
          <div className={css({ bg: "#e8f5e9", p: "12px", borderRadius: "12px", border: "1.5px solid #4caf50", textAlign: "center" })}>
            <div className={css({ fontSize: "14px", color: "#2e7d32", fontWeight: "600" })}>
              ✓ Discord Linked
            </div>
            <div className={css({ fontSize: "12px", color: "#2e7d32", mt: "4px" })}>
              Linked: {state.discordId}
            </div>
          </div>
          <button
            onClick={handleUnlinkDiscord}
            disabled={linkingDiscord}
            className={css({
              p: "10px 16px",
              bg: "white",
              color: "#d32f2f",
              border: "1.5px solid #ffae00",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: linkingDiscord ? "not-allowed" : "pointer",
              transition: "transform 0.1s",
              opacity: linkingDiscord ? "0.6" : "1",
              _hover: linkingDiscord ? {} : { transform: "scale(1.02)" },
            })}
          >
            {linkingDiscord ? "Unlinking..." : "Unlink Discord"}
          </button>
        </div>
      ) : (
        // Discord is not linked
        <div className={css({ display: "flex", flexDir: "column", gap: "12px" })}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Discord ID (snowflake)"
            value={discordInput}
            onChange={(e) => setDiscordInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!state.isConnected || linkingDiscord}
            className={css({
              p: "10px 14px",
              borderRadius: "12px",
              border: "1.5px solid #ffae00",
              fontSize: "14px",
              bg: "white",
              color: "#513d0a",
              _placeholder: { color: "#b48512" },
              opacity: !state.isConnected ? "0.6" : "1",
              cursor: !state.isConnected ? "not-allowed" : "text",
            })}
          />
          <button
            onClick={handleLinkDiscord}
            disabled={!state.isConnected || linkingDiscord}
            className={css({
              p: "10px 16px",
              bg: "white",
              color: "#ff7700",
              border: "1.5px solid #ffae00",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: !state.isConnected || linkingDiscord ? "not-allowed" : "pointer",
              transition: "transform 0.1s",
              opacity: !state.isConnected || linkingDiscord ? "0.6" : "1",
              _hover: !state.isConnected || linkingDiscord ? {} : { transform: "scale(1.02)" },
            })}
          >
            {linkingDiscord ? "Linking..." : "Link Discord with your wallet"}
          </button>
        </div>
      )}

      {!state.isConnected && (
        <div className={css({ fontSize: "14px", color: "#b48512", mt: "12px", textAlign: "center" })}>
          Connect wallet to link your Discord.
        </div>
      )}
    </RetroBox>
  );
}
