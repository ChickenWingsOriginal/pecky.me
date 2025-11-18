// Wallet Types
export interface WalletBalance {
  micro: bigint;
  pecky: number;
}

// NFT Types
export type NFTRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface NFTReward {
  tokenId: number;
  rarity: NFTRarity;
  monthlyPayout: number;
  lastClaimTime?: number;
  canClaim: boolean;
}

// Staking Types
export interface StakeInfo {
  amount: number;
  rewards: number;
  lastClaimTime?: number;
}

// Bot Types
export interface BotStatus {
  isActive: boolean;
  expiresAt?: number;
  daysExtended?: number;
}

// Transaction Types
export interface TransactionResult {
  hash: string;
  status: "success" | "pending" | "failed";
  timestamp: number;
}

// Vault Types
export interface VaultInfo {
  totalAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

// Discord Link Types
export interface DiscordLinkStatus {
  isLinked: boolean;
  discordId?: string;
  linkedAt?: number;
}
