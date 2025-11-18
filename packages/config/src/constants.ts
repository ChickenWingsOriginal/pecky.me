// Supra Blockchain Configuration
export const SUPRA_CONFIG = {
  TABLE_HANDLE: "0xbf3d300e9d7444b36d9b036c45f95c092fd7b62fe5093f54b891f3916179197c",
  PECKY_COIN_MODULE: "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d",
  BURN_ADDRESS: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  MERIDIAN_POOL: "0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331",
  DECIMALS: 6,
};

// RPC Endpoints
export const RPC_ENDPOINTS = {
  MAINNET: "https://rpc-mainnet.supra.com/rpc/v1",
  VAULT_AIRDROP: "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::VaultAirdrop",
  VAULT_NFT: "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::ClaimNFT::VaultNFT",
  COINSTORE: "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0x1%3A%3Acoin%3A%3ACoinStore%3C0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d%3A%3ACoin%3A%3APecky%3E",
};

// Vault Configuration
export const VAULT_CONFIG = {
  TOTAL: 1_000_000_000_000,
  AIRDROP_TOTAL: 100_000_000_000,
};

// NFT Configuration
export const NFT_CONFIG = {
  TOTAL_SUPPLY: 500,
  ROYALTY_PERCENTAGE: 5,
  RARITIES: {
    common: { count: 250, monthlyPercent: 1 },
    rare: { count: 125, monthlyPercent: 1 },
    epic: { count: 75, monthlyPercent: 0.75 },
    legendary: { count: 40, monthlyPercent: 0.75 },
    mythic: { count: 10, monthlyPercent: 0.5 },
  },
};

// External Links
export const EXTERNAL_LINKS = {
  DISCORD: "https://discord.gg/VBpsWrUD",
  TWITTER: "https://x.com/Chickens_sup",
  CRYSTARA: "https://crystara.trade/trade/chickenwings",
  DEXLYN: "https://app.dexlyn.com/?inputCurrency=SUPRA&amount=&outputCurrency=PECKY",
  SUPRA: "https://supra.com/",
  RIBBIT_WALLET: "https://ribbitwallet.com/",
  MERIDIAN: "https://futurameridian.com",
};

// Pecky Quotes
export const PECKY_QUOTES = [
  "While you were sleeping, Pecky bought the dip.",
  "NFT? Nah, it's a Not-Fried-Turkey.",
  "Keep calm and let the chicken moon.",
  "Staking? Pecky's been sitting on golden eggs for weeks.",
  "One wallet to hatch them all.",
  "The only rug Pecky knows is his nest.",
  "In Pecky we trust (and maybe in memes too).",
  "Pecky's wings aren't just for flying – they're for flipping NFTs.",
  "This wallet smells like victory and Doritos.",
  "Counting your chickens before they hatch...",
];
