/**
 * Server-Side Blockchain Data Fetching
 *
 * These functions fetch public blockchain data and can be called from Server Components.
 * They support Next.js ISR caching via the `next: { revalidate }` option.
 */

import { RPC_BASE, PECKY_COIN_MODULE } from "@/app/utils/constants";

/**
 * Fetch the total amount of burned Pecky tokens
 * Burned tokens are sent to the 0xfff...fff address
 */
export async function getBurnedPecky(): Promise<bigint> {
  try {
    const BURN_ADDRESS =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const PECKY_RESOURCE_TYPE = `0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<${PECKY_COIN_MODULE}::Coin::Pecky>`;
    const encoded = encodeURIComponent(PECKY_RESOURCE_TYPE);

    const response = await fetch(
      `${RPC_BASE}/rpc/v1/accounts/${BURN_ADDRESS}/resources/${encoded}`,
      {
        next: { revalidate: 60 }, // ISR: Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data?.result?.[0]?.coin?.value) {
      return BigInt(data.result[0].coin.value);
    }
    return BigInt(0);
  } catch (error) {
    console.error("Failed to fetch burned Pecky:", error);
    return BigInt(0);
  }
}