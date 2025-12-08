import { NFTS_CACHE_KEY } from "./constants";

interface OwnedNFT {
  name: string;
  rarity?: string;
  claimStatus?: { status: "claimable" | "cooldown" | "unknown"; text: string };
  airdropAvailable?: boolean;
}

export function saveNftsToCache(
  walletAddress: string,
  nfts: OwnedNFT[]
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      NFTS_CACHE_KEY,
      JSON.stringify({
        walletAddress,
        data: nfts,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save NFTs to cache:", error);
  }
}
