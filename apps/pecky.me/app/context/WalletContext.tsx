"use client";

import React, {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchOwnedNfts,
  fetchOwnedNodeNfts,
  fetchPeckyBalance,
  checkDiscordLinkStatus,
} from "@/app/utils/walletService";
import {
  rarityLabel,
  fetchActiveNodesSorted,
  getAttachedMainNames,
} from "@/app/utils/nodeService";

// Types
export interface NFT {
  id: string;
  name: string;
  imageUrl?: string;
  collection?: string;
  rarity?: string;
}

export interface DelegationPoolInfo {
  poolAddress: string;
  stakedAmount: bigint;
  rewards?: bigint;
}

export interface ActiveNode {
  nodeId: string;
  name: string;
}

export interface OwnedNode {
  nodeId: string;
  name: string;
  linkedRarities: string[]; // NFT token names linked to this node
}

export interface WalletState {
  // Connection
  walletAddress: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // Balances
  peckyBalance: bigint | null;
  supraBalance: bigint | null;

  // Staking
  stakedAmount: bigint | null;
  delegationPoolInfo: DelegationPoolInfo | null;

  // NFTs
  ownedNfts: NFT[] | null;
  ownedRarityNfts: string[] | null; // TOKEN_X names that user owns
  availableRarityNfts: string[] | null; // TOKEN_X names not linked to any node

  // Nodes
  allNodes: ActiveNode[] | null; // All active nodes in the network
  ownedNodes: OwnedNode[] | null;

  // Status
  isRegistered: boolean | null;
  isDiscordLinked: boolean | null;
  discordId: string | null;

  // Refresh status
  isLoadingBalances: boolean;
  isLoadingNfts: boolean;
  isLoadingStaking: boolean;
  isLoadingNodes: boolean;
  lastBalanceRefresh: number | null;
  lastNftRefresh: number | null;
}

export type WalletAction =
  | { type: "WALLET_CONNECTING" }
  | { type: "WALLET_CONNECTED"; payload: { address: string } }
  | { type: "WALLET_DISCONNECTED" }
  | { type: "SET_PECKY_BALANCE"; payload: bigint }
  | { type: "SET_SUPRA_BALANCE"; payload: bigint }
  | {
      type: "SET_STAKING_INFO";
      payload: { stakedAmount: bigint; poolInfo?: DelegationPoolInfo };
    }
  | { type: "SET_NFTS"; payload: NFT[] }
  | { type: "SET_OWNED_RARITY_NFTS"; payload: string[] }
  | { type: "SET_AVAILABLE_RARITY_NFTS"; payload: string[] }
  | { type: "SET_ALL_NODES"; payload: ActiveNode[] }
  | { type: "SET_OWNED_NODES"; payload: OwnedNode[] }
  | { type: "SET_REGISTRATION_STATUS"; payload: boolean }
  | {
      type: "SET_DISCORD_STATUS";
      payload: { isLinked: boolean; discordId?: string };
    }
  | { type: "SET_LOADING_BALANCES"; payload: boolean }
  | { type: "SET_LOADING_NFTS"; payload: boolean }
  | { type: "SET_LOADING_STAKING"; payload: boolean }
  | { type: "SET_LOADING_NODES"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_REFRESH_TIME"; payload: "balances" | "nfts" };

const initialState: WalletState = {
  walletAddress: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  peckyBalance: null,
  supraBalance: null,
  stakedAmount: null,
  delegationPoolInfo: null,
  ownedNfts: null,
  ownedRarityNfts: null,
  availableRarityNfts: null,
  allNodes: null,
  ownedNodes: null,
  isRegistered: null,
  isDiscordLinked: null,
  discordId: null,
  isLoadingBalances: false,
  isLoadingNfts: false,
  isLoadingStaking: false,
  isLoadingNodes: false,
  lastBalanceRefresh: null,
  lastNftRefresh: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "WALLET_CONNECTING":
      return { ...state, isConnecting: true, error: null };

    case "WALLET_CONNECTED":
      return {
        ...state,
        walletAddress: action.payload.address,
        isConnected: true,
        isConnecting: false,
        error: null,
      };

    case "WALLET_DISCONNECTED":
      return initialState;

    case "SET_PECKY_BALANCE":
      return { ...state, peckyBalance: action.payload };

    case "SET_SUPRA_BALANCE":
      return { ...state, supraBalance: action.payload };

    case "SET_STAKING_INFO":
      return {
        ...state,
        stakedAmount: action.payload.stakedAmount,
        delegationPoolInfo: action.payload.poolInfo || null,
      };

    case "SET_NFTS":
      return { ...state, ownedNfts: action.payload };

    case "SET_OWNED_RARITY_NFTS":
      return { ...state, ownedRarityNfts: action.payload };

    case "SET_AVAILABLE_RARITY_NFTS":
      return { ...state, availableRarityNfts: action.payload };

    case "SET_ALL_NODES":
      return { ...state, allNodes: action.payload };

    case "SET_OWNED_NODES":
      return { ...state, ownedNodes: action.payload };

    case "SET_REGISTRATION_STATUS":
      return { ...state, isRegistered: action.payload };

    case "SET_DISCORD_STATUS":
      return {
        ...state,
        isDiscordLinked: action.payload.isLinked,
        discordId: action.payload.discordId || null,
      };

    case "SET_LOADING_BALANCES":
      return { ...state, isLoadingBalances: action.payload };

    case "SET_LOADING_NFTS":
      return { ...state, isLoadingNfts: action.payload };

    case "SET_LOADING_STAKING":
      return { ...state, isLoadingStaking: action.payload };

    case "SET_LOADING_NODES":
      return { ...state, isLoadingNodes: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "UPDATE_REFRESH_TIME":
      if (action.payload === "balances") {
        return { ...state, lastBalanceRefresh: Date.now() };
      } else if (action.payload === "nfts") {
        return { ...state, lastNftRefresh: Date.now() };
      }
      return state;

    default:
      return state;
  }
}

interface WalletContextType {
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshNfts: () => Promise<void>;
  refreshStakingInfo: () => Promise<void>;
  refreshDiscordStatus: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined,
);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connectWallet = useCallback(async () => {
    // This will be handled by the SupraConnect hook
    // We listen for connection events here
    dispatch({ type: "WALLET_CONNECTING" });
  }, []);

  const disconnectWallet = useCallback(async () => {
    dispatch({ type: "WALLET_DISCONNECTED" });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: "SET_LOADING_BALANCES", payload: true });
    try {
      const peckyBalance = await fetchPeckyBalance(state.walletAddress);
      dispatch({ type: "SET_PECKY_BALANCE", payload: peckyBalance });
      dispatch({ type: "UPDATE_REFRESH_TIME", payload: "balances" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to refresh balances",
      });
    } finally {
      dispatch({ type: "SET_LOADING_BALANCES", payload: false });
    }
  }, [state.walletAddress]);

  const refreshNfts = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: "SET_LOADING_NFTS", payload: true });
    try {
      const nfts = await fetchOwnedNfts(state.walletAddress);
      dispatch({
        type: "SET_NFTS",
        payload: nfts.map((nft) => ({
          id: nft.id,
          name: nft.name,
          image: nft.image,
          rarity: rarityLabel(nft.name),
        })),
      });
      dispatch({ type: "UPDATE_REFRESH_TIME", payload: "nfts" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to refresh NFTs",
      });
    } finally {
      dispatch({ type: "SET_LOADING_NFTS", payload: false });
    }
  }, [state.walletAddress]);

  const refreshStakingInfo = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: "SET_LOADING_STAKING", payload: true });
    try {
      // Will be implemented with actual RPC calls
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to refresh staking info",
      });
    } finally {
      dispatch({ type: "SET_LOADING_STAKING", payload: false });
    }
  }, [state.walletAddress]);

  const refreshDiscordStatus = useCallback(async () => {
    if (!state.walletAddress) return;
    try {
      const discordStatus = await checkDiscordLinkStatus(state.walletAddress);
      dispatch({
        type: "SET_DISCORD_STATUS",
        payload: discordStatus,
      });
    } catch (error) {
      console.error("Failed to refresh Discord status:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to refresh Discord status",
      });
    }
  }, [state.walletAddress]);

  // When wallet connects, fetch: 1) balance, 2) NFTs, 3) all nodes in parallel
  // Then: 4) owned nodes, 5) linked NFTs per node in parallel
  // Then: calculate available NFTs
  useEffect(() => {
    if (!state.walletAddress) return;

    const walletAddress = state.walletAddress;

    (async () => {
      try {
        // PHASE 1: Parallel fetch - Rarity NFTs, Node NFTs, and all active nodes
        dispatch({ type: "SET_LOADING_NFTS", payload: true });
        dispatch({ type: "SET_LOADING_NODES", payload: true });

        const [nfts, ownedNodeTokenNames, allNodes] = await Promise.all([
          fetchOwnedNfts(walletAddress),
          fetchOwnedNodeNfts(walletAddress),
          fetchActiveNodesSorted(),
        ]);

        // Store all active nodes in context
        dispatch({ type: "SET_ALL_NODES", payload: allNodes });

        // Update NFTs in state
        dispatch({
          type: "SET_NFTS",
          payload: nfts.map((nft) => ({
            id: nft.id,
            name: nft.name,
            image: nft.image,
            rarity: rarityLabel(nft.name),
          })),
        });

        // Extract rarity NFT names from owned NFTs
        const ownedRarityNames = nfts
          .map((nft) => nft.name)
          .filter((name) => /^TOKEN_\d+$/.test(name));

        dispatch({ type: "SET_OWNED_RARITY_NFTS", payload: ownedRarityNames });

        // Filter allNodes to get owned nodes based on owned token names
        const ownedNodesData = allNodes.filter((node) =>
          ownedNodeTokenNames.includes(node.nodeId),
        );

        // PHASE 2: For owned nodes, fetch linked rarities in parallel with delays
        const ownedNodesWithLinked: OwnedNode[] = [];
        for (let i = 0; i < ownedNodesData.length; i++) {
          const node = ownedNodesData[i];
          if (i > 0) await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms delay

          const linkedNames = await getAttachedMainNames(node.nodeId);
          ownedNodesWithLinked.push({
            nodeId: node.nodeId,
            name: node.name,
            linkedRarities: linkedNames,
          });
        }

        dispatch({ type: "SET_OWNED_NODES", payload: ownedNodesWithLinked });

        // PHASE 3: Calculate available NFTs
        const allLinkedNfts = new Set(
          ownedNodesWithLinked.flatMap((node) => node.linkedRarities),
        );
        const availableRarities = ownedRarityNames.filter(
          (name) => !allLinkedNfts.has(name),
        );

        dispatch({
          type: "SET_AVAILABLE_RARITY_NFTS",
          payload: availableRarities,
        });

        console.log("Wallet data fetched:", {
          ownedRarityNames,
          ownedNodeTokenNames,
          ownedNodes: ownedNodesWithLinked,
          availableRarities,
        });
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to fetch wallet data",
        });
      } finally {
        dispatch({ type: "SET_LOADING_NFTS", payload: false });
        dispatch({ type: "SET_LOADING_NODES", payload: false });
      }
    })();
  }, [state.walletAddress]);

  return (
    <WalletContext.Provider
      value={{
        state,
        dispatch,
        connectWallet,
        disconnectWallet,
        refreshBalances,
        refreshNfts,
        refreshStakingInfo,
        refreshDiscordStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
