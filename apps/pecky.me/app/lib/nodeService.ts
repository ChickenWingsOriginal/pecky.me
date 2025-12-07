// @ts-ignore
import { BCS, SupraClient } from "supra-l1-sdk";

const STAKE_MODULE = "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const RPC_URL = "https://rpc-mainnet.supra.com";

interface ActiveNode {
  nodeId: string;
  name: string;
}

export async function fetchActiveNodesSorted(): Promise<ActiveNode[]> {
  try {
    const client = await SupraClient.init(RPC_URL);

    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::list_active_display_names_with_token_id_sorted_by_stake`,
      [], // type arguments
      [], // arguments
    );

    let nodeData = result[0] || [];

    // Handle nested array responses: [ [ ["Name","TOKEN_11"], ... ] ]
    if (Array.isArray(nodeData) && nodeData.length === 1 && Array.isArray(nodeData[0])) {
      nodeData = nodeData[0];
    }

    const items: ActiveNode[] = [];

    for (const row of nodeData) {
      let name = "";
      let token = "";

      if (Array.isArray(row)) {
        // Expected format: ["Display Name", "TOKEN_XX"]
        name = String(row[0] ?? "").trim();
        token = String(row[1] ?? "").trim();
      } else if (row && typeof row === "object") {
        // Fallback for object format
        name = String(row.display_name ?? row.name ?? "").trim();
        token = String(row.token_id ?? row.node_id ?? row.token ?? "").trim();
      }

      // Validate token format
      if (!/^TOKEN_\d+$/.test(token)) continue;

      // Use token as name if display name not available
      if (!name) name = token;

      items.push({ nodeId: token, name });
    }

    return items;
  } catch (error) {
    console.error("Failed to fetch active nodes:", error);
    return [];
  }
}

export function formatPeckyBalance(balance: bigint | null, decimals = 6): string {
  if (!balance) return "0";
  const balanceNumber = Number(balance) / Math.pow(10, decimals);
  return balanceNumber.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function serializeString(str: string): Uint8Array {
  return BCS.bcsSerializeStr(str);
}

export async function getOperatorRewards(nodeId: string): Promise<number> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_operator_rewards`,
      [],
      [nodeId],
    );
    const micro = Array.isArray(result) ? BigInt(result[0] ?? 0) : BigInt(result ?? 0);
    return Number(micro) / 1_000_000;
  } catch (error) {
    console.error(`Failed to fetch operator rewards for ${nodeId}:`, error);
    return 0;
  }
}

export async function getOperatorApyForOwner(nodeId: string): Promise<number> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_operator_apy_for_owner_bps`,
      [],
      [nodeId],
    );

    let v = Array.isArray(result) ? (result[0] ?? 0) : result;
    if (typeof v === "string" && /^0x/i.test(v)) v = parseInt(v as string, 16);
    const bps = Number(v);

    return isFinite(bps) ? bps / 100 : 0; // 500 bps -> 5 (%)
  } catch (error) {
    console.error(`Failed to fetch operator APY for ${nodeId}:`, error);
    return 0;
  }
}

export async function getAttachedMainNames(nodeId: string): Promise<string[]> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_attached_main_names`,
      [],
      [nodeId],
    );
    const arr = Array.isArray(result) ? (result[0] ?? result) : [];
    return (Array.isArray(arr) ? arr : []).map((x) => String(x)).filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch attached names for ${nodeId}:`, error);
    return [];
  }
}

export async function getMissingAttachedNfts(nodeId: string): Promise<string[]> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_missing_attached_nfts_for_owner`,
      [],
      [nodeId],
    );
    const arr = Array.isArray(result) ? (result[0] ?? result) : [];
    return (Array.isArray(arr) ? arr : []).map((x) => String(x)).filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch missing attached NFTs for ${nodeId}:`, error);
    return [];
  }
}

export function tokenNumberFromName(tokenName: string = ""): number {
  const m = String(tokenName).match(/^TOKEN_(\d{1,4})$/i);
  return m ? parseInt(m[1], 10) : NaN;
}

export function rarityLabel(tokenName: string): string {
  const n = tokenNumberFromName(tokenName);
  let rarity = "Unknown";
  if (n >= 1 && n <= 250) rarity = "Common";
  else if (n >= 251 && n <= 375) rarity = "Rare";
  else if (n >= 376 && n <= 450) rarity = "Epic";
  else if (n >= 451 && n <= 490) rarity = "Legendary";
  else if (n >= 491 && n <= 500) rarity = "Mythic";
  const chickenTokens = [1, 251, 376, 451, 491];
  return chickenTokens.includes(n) ? `${rarity} 🍗` : rarity;
}

export async function getUserStake(walletAddress: string, nodeId: string): Promise<bigint> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_user_stake`,
      [],
      [walletAddress, nodeId],
    );
    return BigInt(result[0] || 0);
  } catch (error) {
    console.error(`Failed to fetch user stake for ${walletAddress} on ${nodeId}:`, error);
    return BigInt(0);
  }
}

export async function getUserRewards(walletAddress: string, nodeId: string): Promise<bigint> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_user_rewards`,
      [],
      [walletAddress, nodeId],
    );
    return BigInt(result[0] || 0);
  } catch (error) {
    console.error(`Failed to fetch user rewards for ${walletAddress} on ${nodeId}:`, error);
    return BigInt(0);
  }
}

export interface PendingUnstake {
  release: bigint; // Unix timestamp in seconds
  amountMicro: bigint;
  claimable: boolean;
}

export async function getPendingUnstakes(walletAddress: string): Promise<PendingUnstake[]> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::get_pending_unstakes`,
      [],
      [walletAddress],
    );

    let arr = Array.isArray(result) ? result : [];
    if (arr.length === 1 && Array.isArray(arr[0])) arr = arr[0];

    const out: PendingUnstake[] = [];
    for (const item of arr) {
      if (!item) continue;

      const tsRaw = Array.isArray(item) ? item[0] : item.release_time ?? 0;
      const amtRaw = Array.isArray(item) ? item[1] : item.amount ?? 0;
      const clRaw = Array.isArray(item) ? item[2] : item.claimable ?? 0;

      const release = BigInt(tsRaw ?? 0);
      const amountMicro = BigInt(amtRaw ?? 0);
      const claimable = typeof clRaw === "boolean"
        ? clRaw
        : Array.isArray(clRaw)
        ? !!clRaw[0]
        : Number(clRaw || 0) !== 0;

      if (amountMicro > BigInt(0)) {
        out.push({ release, amountMicro, claimable });
      }
    }

    return out;
  } catch (error) {
    console.error(`Failed to fetch pending unstakes for ${walletAddress}:`, error);
    return [];
  }
}

export async function getOwnedNodes(walletAddress: string, allNodes: ActiveNode[]): Promise<ActiveNode[]> {
  try {
    const client = await SupraClient.init(RPC_URL);
    const ownedNodes: ActiveNode[] = [];

    for (const node of allNodes) {
      const result = await client.invokeViewMethod(
        `${STAKE_MODULE}::stake::is_node_owner`,
        [],
        [node.nodeId, walletAddress],
      );

      if (result[0] === true) {
        ownedNodes.push(node);
      }
    }

    return ownedNodes;
  } catch (error) {
    console.error(`Failed to fetch owned nodes for ${walletAddress}:`, error);
    return [];
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getActiveNodesWithOwnership(
  walletAddress?: string
): Promise<{ allNodes: ActiveNode[]; ownedNodes: ActiveNode[] }> {
  try {
    const client = await SupraClient.init(RPC_URL);

    // Fetch all active nodes
    const result = await client.invokeViewMethod(
      `${STAKE_MODULE}::stake::list_active_display_names_with_token_id_sorted_by_stake`,
      [],
      [],
    );

    let nodeData = result[0] || [];

    // Handle nested array responses: [ [ ["Name","TOKEN_11"], ... ] ]
    if (Array.isArray(nodeData) && nodeData.length === 1 && Array.isArray(nodeData[0])) {
      nodeData = nodeData[0];
    }

    const allNodes: ActiveNode[] = [];

    for (const row of nodeData) {
      let name = "";
      let token = "";

      if (Array.isArray(row)) {
        // Expected format: ["Display Name", "TOKEN_XX"]
        name = String(row[0] ?? "").trim();
        token = String(row[1] ?? "").trim();
      } else if (row && typeof row === "object") {
        // Fallback for object format
        name = String(row.display_name ?? row.name ?? "").trim();
        token = String(row.token_id ?? row.node_id ?? row.token ?? "").trim();
      }

      // Validate token format
      if (!/^TOKEN_\d+$/.test(token)) continue;

      // Use token as name if display name not available
      if (!name) name = token;

      allNodes.push({ nodeId: token, name });
    }

    // If no wallet connected, return all nodes with empty owned list
    if (!walletAddress) {
      return { allNodes, ownedNodes: [] };
    }

    // Check ownership for each node with 10ms delay between requests
    const ownershipResults: Array<{ nodeId: string; isOwner: boolean }> = [];
    for (let i = 0; i < allNodes.length; i++) {
      const node = allNodes[i];
      if (i > 0) await delay(10); // 10ms delay between requests (skip first)

      try {
        const res: any = await client.invokeViewMethod(
          `${STAKE_MODULE}::stake::is_node_owner`,
          [],
          [node.nodeId, walletAddress],
        );
        ownershipResults.push({ nodeId: node.nodeId, isOwner: res[0] === true });
      } catch {
        ownershipResults.push({ nodeId: node.nodeId, isOwner: false });
      }
    }

    const ownedNodes = allNodes.filter((node) =>
      ownershipResults.find((r) => r.nodeId === node.nodeId && r.isOwner)
    );

    return { allNodes, ownedNodes };
  } catch (error) {
    console.error("Failed to fetch active nodes with ownership:", error);
    return { allNodes: [], ownedNodes: [] };
  }
}
