// Wallet Service - Handles all RPC calls and API requests for wallet data

const RPC_BASE = "https://rpc-mainnet.supra.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.pecky.me";

const PECKY_COIN_MODULE =
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const PECKY_TOKEN_TYPE = `0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<${PECKY_COIN_MODULE}::Coin::Pecky>`;
const DECIMALS = 6; // Pecky uses 6 decimal places (micro-units)
const MERIDIAN_POOL =
  "0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331"; // Staking pool address

// Helper to make REST API calls
async function restCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`REST call failed (${endpoint}):`, error);
    throw error;
  }
}

// Helper to make view function calls (v1 - for most functions)
async function viewCall<T>(payload: {
  function: string;
  type_arguments: string[];
  arguments: unknown[];
}): Promise<T> {
  try {
    const response = await fetch(`${RPC_BASE}/rpc/v1/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`View call failed:`, error);
    throw error;
  }
}

// Helper for v2 view calls (used for Pecky price)
async function viewCallV2<T>(payload: {
  function: string;
  type_arguments: string[];
  arguments: unknown[];
}): Promise<T> {
  try {
    const response = await fetch(`${RPC_BASE}/rpc/v2/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`View call failed:`, error);
    throw error;
  }
}

// Fetch Pecky balance for wallet address
export async function fetchPeckyBalance(
  walletAddress: string,
): Promise<bigint> {
  try {
    const encoded = encodeURIComponent(PECKY_TOKEN_TYPE);

    // Try v2 first
    try {
      const json = await restCall<any>(
        `${RPC_BASE}/rpc/v2/accounts/${walletAddress}/resources/${encoded}`,
      );
      if (json?.data?.coin?.value) {
        return BigInt(json.data.coin.value);
      }
    } catch {}

    // Try v1 if v2 fails
    const json = await restCall<any>(
      `${RPC_BASE}/rpc/v1/accounts/${walletAddress}/resources/${encoded}`,
    );

    if (json?.data?.coin?.value) {
      return BigInt(json.data.coin.value);
    } else if (Array.isArray(json?.result)) {
      const cs = json.result.find((r: any) => r?.type === PECKY_TOKEN_TYPE);
      const raw = cs?.coin?.value || cs?.data?.coin?.value || "0";
      return BigInt(raw);
    }

    return BigInt(0);
  } catch (error) {
    console.error("Failed to fetch Pecky balance:", error);
    return BigInt(0);
  }
}

// Fetch Supra balance for wallet address
export async function fetchSupraBalance(
  walletAddress: string,
): Promise<bigint> {
  try {
    // Similar to Pecky but for Supra coin
    const supraTokenType = encodeURIComponent(
      "0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<0x1::supra_coin::SupraCoin>",
    );

    try {
      const json = await restCall<any>(
        `${RPC_BASE}/rpc/v2/accounts/${walletAddress}/resources/${supraTokenType}`,
      );
      if (json?.data?.coin?.value) {
        return BigInt(json.data.coin.value);
      }
    } catch {}

    const json = await restCall<any>(
      `${RPC_BASE}/rpc/v1/accounts/${walletAddress}/resources/${supraTokenType}`,
    );

    if (json?.data?.coin?.value) {
      return BigInt(json.data.coin.value);
    } else if (Array.isArray(json?.result)) {
      const cs = json.result.find((r: any) => r?.type?.includes("SupraCoin"));
      const raw = cs?.coin?.value || cs?.data?.coin?.value || "0";
      return BigInt(raw);
    }

    return BigInt(0);
  } catch (error) {
    console.error("Failed to fetch Supra balance:", error);
    return BigInt(0);
  }
}

// Fetch circulating supply
export async function fetchCirculatingSupply(): Promise<bigint | null> {
  try {
    const result = await viewCallV2<string[]>({
      function: `${PECKY_COIN_MODULE}::Supply::total_released_all`,
      type_arguments: [],
      arguments: [],
    });

    if (Array.isArray(result) && result.length > 0) {
      const micro = result[0];
      if (typeof micro === "string") {
        return BigInt(micro);
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch circulating supply:", error);
    return null;
  }
}

// Fetch Pecky price (cost in Supra per Pecky)
export async function fetchPeckyPrice(): Promise<number | null> {
  try {
    const result = await viewCallV2<string[]>({
      function:
        "0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::router::get_reserves_size",
      type_arguments: [
        `${PECKY_COIN_MODULE}::Coin::Pecky`,
        "0x1::supra_coin::SupraCoin",
        "0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::curves::Uncorrelated",
      ],
      arguments: [],
    });

    if (!Array.isArray(result) || result.length < 2) {
      return null;
    }

    const [peckyReserve, supraReserve] = result.map(BigInt);

    if (peckyReserve === BigInt(0)) {
      return null;
    }

    // price in Supra per Pecky = (supraReserve / peckyReserve) * 0.01
    const price = (Number(supraReserve) / Number(peckyReserve)) * 0.01;
    return price;
  } catch (error) {
    console.error("Failed to fetch Pecky price:", error);
    return null;
  }
}

// Fetch staking information
export async function fetchStakingInfo(
  walletAddress: string,
): Promise<{ stakedAmount: bigint; poolAddress?: string }> {
  try {
    // View call to check if wallet has staked in delegation pool
    // Note: get_stake requires [poolAddress, walletAddress] arguments
    const result = await viewCall<string[]>({
      function: "0x1::pbo_delegation_pool::get_stake",
      type_arguments: [],
      arguments: [MERIDIAN_POOL, walletAddress],
    });

    if (Array.isArray(result) && result.length > 0) {
      const stakedAmount = BigInt(result[0]);
      return { stakedAmount };
    }
    return { stakedAmount: BigInt(0) };
  } catch (error) {
    console.error("Failed to fetch staking info:", error);
    // Return 0 if call fails (wallet may not be staking)
    return { stakedAmount: BigInt(0) };
  }
}

// Check if wallet is registered for rewards
export async function checkRegistrationStatus(
  walletAddress: string,
): Promise<boolean> {
  try {
    const result = await viewCall<string[]>({
      function: `${PECKY_COIN_MODULE}::Coin::is_pecky_registered`,
      type_arguments: [],
      arguments: [walletAddress],
    });

    return Array.isArray(result) && result.length > 0 ? !!result[0] : false;
  } catch (error) {
    console.error("Failed to check registration status:", error);
    return false;
  }
}

// Check if wallet has Discord linked
export async function checkDiscordLinkStatus(walletAddress: string): Promise<{
  isLinked: boolean;
  discordId?: string;
}> {
  try {
    const isLinked = await viewCall<string[]>({
      function: `${PECKY_COIN_MODULE}::discord_link::is_registered`,
      type_arguments: [],
      arguments: [walletAddress],
    });

    if (!Array.isArray(isLinked) || !isLinked[0]) {
      return { isLinked: false };
    }

    // If linked, get Discord ID
    // Note: get_discord_id returns (bool, u128) - [exists, discord_id]
    const discordIdResult = await viewCall<[boolean, string]>({
      function: `${PECKY_COIN_MODULE}::discord_link::get_discord_id`,
      type_arguments: [],
      arguments: [walletAddress],
    });

    const discordId =
      Array.isArray(discordIdResult) && discordIdResult.length > 1 && discordIdResult[0]
        ? discordIdResult[1]  // Second element is the actual Discord ID (u128)
        : undefined;
    return {
      isLinked: true,
      discordId,
    };
  } catch (error) {
    console.error("Failed to check Discord link status:", error);
    return { isLinked: false };
  }
}

// Fetch NFTs owned by wallet
export async function fetchOwnedNfts(
  walletAddress: string,
): Promise<Array<{ id: string; name: string; image: string }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/nfts?wallet=${walletAddress}`,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    // API returns either "nfts" or "owned_tokens"
    const nfts = data.nfts || data.owned_tokens || [];
    console.log("Fetched NFTs from API:", { raw: data, parsed: nfts });
    return nfts;
  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
    throw error;
  }
}

// Fetch Pecky Node NFTs owned by wallet
export async function fetchOwnedNodeNfts(
  walletAddress: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/pecky-node-nfts?wallet=${walletAddress}`,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    // API returns: { network: "mainnet", owned_tokens: [{ name: "TOKEN_11", ... }] }
    const ownedTokens = data.owned_tokens || [];

    // Extract token names (e.g., "TOKEN_11", "TOKEN_25")
    const tokenNames = ownedTokens
      .map((token: any) => token.name)
      .filter((name: string) => /^TOKEN_\d+$/.test(name));

    console.log("Fetched owned node NFTs from API:", tokenNames);
    return tokenNames;
  } catch (error) {
    console.error("Failed to fetch owned node NFTs:", error);
    return [];
  }
}

// Fetch NFT pool remaining amount
export async function fetchNftPoolRemaining(): Promise<bigint> {
  try {
    const VAULT_NFT_URL = `${RPC_BASE}/rpc/v1/accounts/${PECKY_COIN_MODULE}/resources/${PECKY_COIN_MODULE}::ClaimNFT::VaultNFT`;

    const response = await restCall<{
      result: Array<{
        vault?: {
          value: string;
        };
      }>;
    }>(VAULT_NFT_URL);

    if (response?.result?.[0]?.vault?.value) {
      return BigInt(response.result[0].vault.value);
    }
    return BigInt(0);
  } catch (error) {
    console.error("Failed to fetch NFT pool remaining:", error);
    return BigInt(0);
  }
}

// Fetch total burned Pecky (balance at burn address)
export async function fetchBurnedPecky(): Promise<bigint> {
  try {
    const BURN_ADDRESS =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const PECKY_RESOURCE_TYPE = `0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<${PECKY_COIN_MODULE}::Coin::Pecky>`;
    const encoded = encodeURIComponent(PECKY_RESOURCE_TYPE);

    const response = await restCall<{
      result: Array<{
        coin?: {
          value: string;
        };
      }>;
    }>(`${RPC_BASE}/rpc/v1/accounts/${BURN_ADDRESS}/resources/${encoded}`);

    if (response?.result?.[0]?.coin?.value) {
      return BigInt(response.result[0].coin.value);
    }
    return BigInt(0);
  } catch (error) {
    console.error("Failed to fetch burned Pecky:", error);
    return BigInt(0);
  }
}

// Refresh all wallet data at once
export async function refreshAllWalletData(walletAddress: string) {
  try {
    const [
      peckyBalance,
      supraBalance,
      stakingInfo,
      isRegistered,
      discordStatus,
      nfts,
    ] = await Promise.all([
      fetchPeckyBalance(walletAddress),
      fetchSupraBalance(walletAddress),
      fetchStakingInfo(walletAddress),
      checkRegistrationStatus(walletAddress),
      checkDiscordLinkStatus(walletAddress),
      fetchOwnedNfts(walletAddress),
    ]);

    return {
      peckyBalance,
      supraBalance,
      stakingInfo,
      isRegistered,
      discordStatus,
      nfts,
    };
  } catch (error) {
    console.error("Failed to refresh all wallet data:", error);
    throw error;
  }
}
