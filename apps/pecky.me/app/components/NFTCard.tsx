'use client';

import { css } from "@/styled-system/css";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface NFTCardProps {
  name: string;
  image?: string;
  rarity?: string;
  claimStatus: {
    status: "claimable" | "cooldown" | "unknown";
    text: string;
  };
  airdropAvailable?: boolean;
  isClaiming?: boolean;
  isClaimingAirdrop?: boolean;
  onClaim: (tokenName: string) => Promise<void>;
  onClaimAirdrop: (tokenName: string) => Promise<void>;
  walletConnected?: boolean;
}

// Rarity color mapping
const rarityColors: { [key: string]: string } = {
  "Common": "#0099ff",
  "Rare": "#25c36a",
  "Epic": "#ff53a2",
  "Legendary": "#ffe270",
  "Mythic": "#a259ff",
};

// Extract rarity type from rarity label (remove emoji if present)
function getRarityType(rarityLabel?: string): string {
  if (!rarityLabel) return "Unknown";
  return rarityLabel.replace(/\s*🍗\s*/, "").trim();
}

export function NFTCard({
  name,
  image,
  rarity,
  claimStatus,
  airdropAvailable = false,
  isClaiming = false,
  isClaimingAirdrop = false,
  onClaim,
  onClaimAirdrop,
  walletConnected = false,
}: NFTCardProps) {
  const t = useTranslations('nft');

  const statusColor =
    claimStatus.status === "claimable"
      ? "#29cf41"
      : claimStatus.status === "cooldown"
      ? "#ff9000"
      : "#888";

  // Get border color based on rarity
  const rarityType = getRarityType(rarity);
  const borderColor = rarityColors[rarityType] || "#f3c35b";

  const handleClaimClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onClaim(name);
    } catch (error) {
      console.error("Claim error:", error);
    }
  };

  const handleAirdropClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onClaimAirdrop(name);
    } catch (error) {
      console.error("Airdrop claim error:", error);
    }
  };

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "12px",
        border: `2px solid ${borderColor}`,
        backgroundColor: "white",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      className={css({
        _hover: {
          transform: "scale(1.02)",
          boxShadow: `0 0 12px ${borderColor}40`,
        },
      })}
    >
      {/* NFT Image */}
      {image ? (
        <div className={css({ mb: "8px", textAlign: "center", h: "120px", bg: "#f0f0f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" })}>
          <Image
            src={image}
            alt={name}
            width={100}
            height={100}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
      ) : (
        <div className={css({ mb: "8px", textAlign: "center", h: "120px", bg: "#f0f0f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "12px" })}>
          {t('noImage')}
        </div>
      )}

      {/* NFT Name */}
      <div className={css({ fontSize: "14px", fontWeight: "700", color: "#4a2c00", mb: "4px", textAlign: "center" })}>
        {name}
      </div>

      {/* Rarity */}
      {rarity && rarity !== "Onbekend" && (
        <div className={css({ fontSize: "12px", color: "#a06500", mb: "6px", textAlign: "center" })}>
          {rarity}
        </div>
      )}

      {/* Claim Status */}
      <div
        className={css({
          fontSize: "11px",
          fontWeight: "600",
          color: statusColor,
          textAlign: "center",
          padding: "6px",
          bg: statusColor === "#29cf41" ? "rgba(41, 207, 65, 0.1)" : statusColor === "#ff9000" ? "rgba(255, 144, 0, 0.1)" : "rgba(136, 136, 136, 0.1)",
          borderRadius: "6px",
          mb: "10px",
        })}
      >
        {claimStatus.text}
      </div>

      {/* Action Buttons */}
      {walletConnected && (
        <div className={css({ display: "flex", flexDir: "column", gap: "6px" })}>
          <button
            onClick={handleClaimClick}
            disabled={isClaiming || claimStatus.status === "cooldown"}
            className={css({
              w: "100%",
              p: "8px 10px",
              height: "32px",
              bg: isClaiming || claimStatus.status === "cooldown" ? "#cccccc" : "linear-gradient(to right, #ffaa00, #ff7700)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: isClaiming || claimStatus.status === "cooldown" ? "not-allowed" : "pointer",
              transition: "transform 0.1s",
              _hover: isClaiming || claimStatus.status === "cooldown" ? {} : { transform: "scale(1.02)" },
            })}
          >
            {isClaiming ? t('claiming') : t('claim')}
          </button>

          {airdropAvailable && (
            <button
              onClick={handleAirdropClick}
              disabled={isClaimingAirdrop}
              className={css({
                w: "100%",
                p: "8px 10px",
                height: "32px",
                bg: isClaimingAirdrop ? "#cccccc" : "#29cf41",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: isClaimingAirdrop ? "not-allowed" : "pointer",
                transition: "transform 0.1s",
                _hover: isClaimingAirdrop ? {} : { transform: "scale(1.02)" },
              })}
            >
              {isClaimingAirdrop ? t('claiming') : t('airdropAvailable')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
