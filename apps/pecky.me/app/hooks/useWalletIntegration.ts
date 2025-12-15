'use client';

import { useEffect, useRef } from 'react';
import { useSupraConnect } from '@gerritsen/supra-connect';
import { useWallet } from '@/app/context/WalletContext';
import { refreshAllWalletData, fetchPeckyPrice } from '@/app/utils/walletService';

const BALANCE_REFRESH_INTERVAL = 30000; // 30 seconds
const NFT_REFRESH_INTERVAL = 60000; // 60 seconds

interface ConnectedWalletInfo {
  walletAddress: string;
  connected: boolean;
  type: 'starkey' | 'ribbit';
}

/**
 * Hook that integrates SupraConnect with WalletContext
 * Automatically syncs wallet connection state and refreshes data
 */
export function useWalletIntegration() {
  const { connectedWallet, disconnect } = useSupraConnect();
  const { state, dispatch } = useWallet();

  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nftIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync SupraConnect state with WalletContext
  useEffect(() => {
    if (connectedWallet) {
      // Extract address from ConnectedWallet object
      // The wallet object has: { walletAddress, connected, type }
      const wallet = connectedWallet as ConnectedWalletInfo;
      const address = wallet.walletAddress;

      // Update context if address changed
      if (state.walletAddress !== address && address) {
        dispatch({ type: 'WALLET_CONNECTED', payload: { address } });

        // Fetch all wallet data immediately
        fetchAndUpdateWalletData(address);

        // Set up refresh intervals
        setupRefreshIntervals(address);
      }
    } else if (state.walletAddress) {
      // Wallet was disconnected
      dispatch({ type: 'WALLET_DISCONNECTED' });
      clearRefreshIntervals();
    }

    return () => {
      clearRefreshIntervals();
    };
  }, [connectedWallet, state.walletAddress, dispatch]);

  async function fetchAndUpdateWalletData(address: string) {
    try {
      dispatch({ type: 'SET_LOADING_BALANCES', payload: true });
      dispatch({ type: 'SET_LOADING_NFTS', payload: true });
      dispatch({ type: 'SET_STAKING_LOADING', payload: true });

      const data = await refreshAllWalletData(address);

      // Update all state
      dispatch({ type: 'SET_PECKY_BALANCE', payload: data.peckyBalance });
      dispatch({ type: 'SET_SUPRA_BALANCE', payload: data.supraBalance });
      dispatch({ type: 'SET_MERIDIAN_STAKED_AMOUNT', payload: data.stakingInfo.stakedAmount });
      dispatch({ type: 'SET_REGISTRATION_STATUS', payload: data.isRegistered });
      dispatch({ type: 'SET_DISCORD_STATUS', payload: data.discordStatus });
      dispatch({
        type: 'SET_NFTS',
        payload: data.nfts.map((nft: { id: string; name: string }) => ({
          id: nft.id,
          name: nft.name,
        })),
      });

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallet data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Wallet data fetch error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_BALANCES', payload: false });
      dispatch({ type: 'SET_LOADING_NFTS', payload: false });
      dispatch({ type: 'SET_STAKING_LOADING', payload: false });
    }
  }

  function setupRefreshIntervals(address: string) {
    // Clear any existing intervals
    clearRefreshIntervals();

    // Refresh balances every 30 seconds
    balanceIntervalRef.current = setInterval(async () => {
      try {
        dispatch({ type: 'SET_LOADING_BALANCES', payload: true });

        const { peckyBalance, supraBalance, stakingInfo } = await refreshAllWalletData(address);

        dispatch({ type: 'SET_PECKY_BALANCE', payload: peckyBalance });
        dispatch({ type: 'SET_SUPRA_BALANCE', payload: supraBalance });
        dispatch({ type: 'SET_MERIDIAN_STAKED_AMOUNT', payload: stakingInfo.stakedAmount });
        dispatch({ type: 'UPDATE_REFRESH_TIME', payload: 'balances' });
      } catch (error) {
        console.error('Balance refresh error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING_BALANCES', payload: false });
      }
    }, BALANCE_REFRESH_INTERVAL);

    // Refresh NFTs every 60 seconds
    nftIntervalRef.current = setInterval(async () => {
      try {
        dispatch({ type: 'SET_LOADING_NFTS', payload: true });

        const { nfts } = await refreshAllWalletData(address);

        dispatch({
          type: 'SET_NFTS',
          payload: nfts.map((nft: { id: string; name: string }) => ({
            id: nft.id,
            name: nft.name,
          })),
        });
        dispatch({ type: 'UPDATE_REFRESH_TIME', payload: 'nfts' });
      } catch (error) {
        console.error('NFT refresh error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING_NFTS', payload: false });
      }
    }, NFT_REFRESH_INTERVAL);
  }

  function clearRefreshIntervals() {
    if (balanceIntervalRef.current) {
      clearInterval(balanceIntervalRef.current);
    }
    if (nftIntervalRef.current) {
      clearInterval(nftIntervalRef.current);
    }
  }

  return {
    isConnected: state.isConnected,
    address: state.walletAddress,
  };
}
