'use client';

import React, { createContext, useReducer, useCallback, useEffect, ReactNode } from 'react';

// Types
export interface NFT {
  id: string;
  name: string;
  imageUrl?: string;
  collection?: string;
}

export interface DelegationPoolInfo {
  poolAddress: string;
  stakedAmount: bigint;
  rewards?: bigint;
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

  // Status
  isRegistered: boolean | null;
  isDiscordLinked: boolean | null;
  discordId: string | null;

  // Refresh status
  isLoadingBalances: boolean;
  isLoadingNfts: boolean;
  isLoadingStaking: boolean;
  lastBalanceRefresh: number | null;
  lastNftRefresh: number | null;
}

export type WalletAction =
  | { type: 'WALLET_CONNECTING' }
  | { type: 'WALLET_CONNECTED'; payload: { address: string } }
  | { type: 'WALLET_DISCONNECTED' }
  | { type: 'SET_PECKY_BALANCE'; payload: bigint }
  | { type: 'SET_SUPRA_BALANCE'; payload: bigint }
  | { type: 'SET_STAKING_INFO'; payload: { stakedAmount: bigint; poolInfo?: DelegationPoolInfo } }
  | { type: 'SET_NFTS'; payload: NFT[] }
  | { type: 'SET_REGISTRATION_STATUS'; payload: boolean }
  | { type: 'SET_DISCORD_STATUS'; payload: { isLinked: boolean; discordId?: string } }
  | { type: 'SET_LOADING_BALANCES'; payload: boolean }
  | { type: 'SET_LOADING_NFTS'; payload: boolean }
  | { type: 'SET_LOADING_STAKING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_REFRESH_TIME'; payload: 'balances' | 'nfts' };

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
  isRegistered: null,
  isDiscordLinked: null,
  discordId: null,
  isLoadingBalances: false,
  isLoadingNfts: false,
  isLoadingStaking: false,
  lastBalanceRefresh: null,
  lastNftRefresh: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'WALLET_CONNECTING':
      return { ...state, isConnecting: true, error: null };

    case 'WALLET_CONNECTED':
      return {
        ...state,
        walletAddress: action.payload.address,
        isConnected: true,
        isConnecting: false,
        error: null,
      };

    case 'WALLET_DISCONNECTED':
      return initialState;

    case 'SET_PECKY_BALANCE':
      return { ...state, peckyBalance: action.payload };

    case 'SET_SUPRA_BALANCE':
      return { ...state, supraBalance: action.payload };

    case 'SET_STAKING_INFO':
      return {
        ...state,
        stakedAmount: action.payload.stakedAmount,
        delegationPoolInfo: action.payload.poolInfo || null,
      };

    case 'SET_NFTS':
      return { ...state, ownedNfts: action.payload };

    case 'SET_REGISTRATION_STATUS':
      return { ...state, isRegistered: action.payload };

    case 'SET_DISCORD_STATUS':
      return {
        ...state,
        isDiscordLinked: action.payload.isLinked,
        discordId: action.payload.discordId || null,
      };

    case 'SET_LOADING_BALANCES':
      return { ...state, isLoadingBalances: action.payload };

    case 'SET_LOADING_NFTS':
      return { ...state, isLoadingNfts: action.payload };

    case 'SET_LOADING_STAKING':
      return { ...state, isLoadingStaking: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'UPDATE_REFRESH_TIME':
      if (action.payload === 'balances') {
        return { ...state, lastBalanceRefresh: Date.now() };
      } else if (action.payload === 'nfts') {
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
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connectWallet = useCallback(async () => {
    // This will be handled by the SupraConnect hook
    // We listen for connection events here
    dispatch({ type: 'WALLET_CONNECTING' });
  }, []);

  const disconnectWallet = useCallback(async () => {
    dispatch({ type: 'WALLET_DISCONNECTED' });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: 'SET_LOADING_BALANCES', payload: true });
    try {
      // Will be implemented with actual RPC calls
      dispatch({ type: 'UPDATE_REFRESH_TIME', payload: 'balances' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh balances' });
    } finally {
      dispatch({ type: 'SET_LOADING_BALANCES', payload: false });
    }
  }, [state.walletAddress]);

  const refreshNfts = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: 'SET_LOADING_NFTS', payload: true });
    try {
      // Will be implemented with actual API calls
      dispatch({ type: 'UPDATE_REFRESH_TIME', payload: 'nfts' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh NFTs' });
    } finally {
      dispatch({ type: 'SET_LOADING_NFTS', payload: false });
    }
  }, [state.walletAddress]);

  const refreshStakingInfo = useCallback(async () => {
    if (!state.walletAddress) return;
    dispatch({ type: 'SET_LOADING_STAKING', payload: true });
    try {
      // Will be implemented with actual RPC calls
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh staking info' });
    } finally {
      dispatch({ type: 'SET_LOADING_STAKING', payload: false });
    }
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
