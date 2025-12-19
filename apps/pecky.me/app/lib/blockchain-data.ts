/**
 * Server-Side Blockchain Data Fetching
 *
 * These functions fetch public blockchain data and can be called from Server Components.
 * They support Next.js ISR caching via the `next: { revalidate }` option.
 */

import { RPC_BASE, PECKY_COIN_MODULE } from "@/app/utils/constants";

export interface ActiveNode {
  nodeId: string;
  name: string;
}

/**
 * Fetch the total amount of burned Pecky tokens
 * Burned tokens are sent to the 0xfff...fff address
 * Burns typically occur on the 1st of each month
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
        next: { revalidate: 300 }, // ISR: Cache for 5 minutes (burns happen monthly)
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

/**
 * Fetch all active Pecky staking nodes sorted by stake
 * Returns node IDs and display names
 * Uses direct RPC call for Next.js ISR caching support
 */
export async function getActiveNodes(): Promise<ActiveNode[]> {
  try {
    const STAKE_MODULE = PECKY_COIN_MODULE;
    const functionId = `${STAKE_MODULE}::stake::list_active_display_names_with_token_id_sorted_by_stake`;

    const response = await fetch(
      `${RPC_BASE}/rpc/v2/view`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: functionId,
          arguments: [],
          type_arguments: [],
        }),
        next: { revalidate: 300 }, // ISR: Cache for 5 minutes (nodes don't change frequently)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    let nodeData = data?.result?.[0] || [];

    // Handle nested array responses: [ [ ["Name","TOKEN_11"], ... ] ]
    if (Array.isArray(nodeData) && nodeData.length === 1 && Array.isArray(nodeData[0])) {
      nodeData = nodeData[0];
    }

    const nodes: ActiveNode[] = [];

    for (const row of nodeData) {
      let name = "";
      let token = "";

      if (Array.isArray(row)) {
        // Expected format: ["Display Name", "TOKEN_XX"]
        name = String(row[0] ?? "").trim();
        token = String(row[1] ?? "").trim();
      } else if (row && typeof row === "object") {
        // Fallback for object format
        name = String((row as any).display_name ?? (row as any).name ?? "").trim();
        token = String((row as any).token_id ?? (row as any).node_id ?? (row as any).token ?? "").trim();
      }

      // Validate token format
      if (!/^TOKEN_\d+$/.test(token)) continue;

      // Use token as name if display name not available
      if (!name) name = token;

      nodes.push({ nodeId: token, name });
    }

    return nodes;
  } catch (error) {
    console.error("Failed to fetch active nodes:", error);
    return [];
  }
}