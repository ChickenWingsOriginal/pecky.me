import { NFTS_CACHE_KEY, CACHE_LIFESPAN_MS } from "./constants";

interface OwnedNFT {
  name: string;
  rarity?: string;
  claimStatus?: { status: "claimable" | "cooldown" | "unknown"; text: string };
  airdropAvailable?: boolean;
}

export function getNftsFromCache(walletAddress: string): OwnedNFT[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cache = localStorage.getItem(NFTS_CACHE_KEY);
    if (cache) {
      const parsed = JSON.parse(cache);
      if (parsed.walletAddress === walletAddress && parsed.data) {
        const now = Date.now();
        const cacheAge = now - parsed.timestamp;
        if (cacheAge < CACHE_LIFESPAN_MS) {
          return parsed.data;
        }
        localStorage.removeItem(NFTS_CACHE_KEY);
      }
    }
  } catch (error) {
    console.error("Failed to read NFTs from cache:", error);
  }
  return null;
}
