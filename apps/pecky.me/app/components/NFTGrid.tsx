"use client";

import { css } from "@/styled-system/css";
import { NFTCard } from "./NFTCard";

interface OwnedNFT {
  name: string;
  image?: string;
  rarity?: string;
  claimStatus?: { status: "claimable" | "cooldown" | "unknown"; text: string };
  airdropAvailable?: boolean;
}

interface NFTGridProps {
  nfts: OwnedNFT[];
  onClaim: (tokenName: string) => Promise<void>;
  onClaimAirdrop: (tokenName: string) => Promise<void>;
  isLoading: boolean;
  isClaimingNft?: string | null;
  isClaimingAirdropNft?: string | null;
  walletConnected?: boolean;
}

export function NFTGrid({
  nfts,
  onClaim,
  onClaimAirdrop,
  isLoading,
  isClaimingNft = null,
  isClaimingAirdropNft = null,
  walletConnected = false,
}: NFTGridProps) {
  if (isLoading) {
    return (
      <div
        className={css({ textAlign: "center", py: "20px", color: "#a06500" })}
      >
        Loading your NFTs...
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div
        className={css({ textAlign: "center", py: "20px", color: "#a06500" })}
      >
        No NFTs found
      </div>
    );
  }

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
        mb: "16px",
      })}
    >
      {nfts.map((nft) => {
        console.log("NFT", nft.name, nft.image);
        return (
          <NFTCard
            key={nft.name}
            name={nft.name}
            image={nft.image}
            rarity={nft.rarity}
            claimStatus={
              nft.claimStatus || {
                status: "unknown",
                text: "Loading...",
              }
            }
            airdropAvailable={nft.airdropAvailable}
            isClaiming={isClaimingNft === nft.name}
            isClaimingAirdrop={isClaimingAirdropNft === nft.name}
            onClaim={onClaim}
            onClaimAirdrop={onClaimAirdrop}
            walletConnected={walletConnected}
          />
        );
      })}
    </div>
  );
}
