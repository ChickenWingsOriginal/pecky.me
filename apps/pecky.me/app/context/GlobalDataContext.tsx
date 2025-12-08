'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { fetchPeckyPrice, fetchCirculatingSupply, fetchBurnedPecky, fetchNftPoolRemaining } from '@/app/utils/walletService';
import { fetchActiveNodesSorted } from '@/app/utils/nodeService';

export interface ActiveNode {
  nodeId: string;
  name: string;
}

export interface GlobalDataState {
  peckyPrice: number | null;
  circulatingSupply: bigint | null;
  burnedPecky: bigint | null;
  nftPoolRemaining: bigint | null;
  activeNodes: ActiveNode[];
  isLoading: boolean;
  error: string | null;
}

interface GlobalDataContextType extends GlobalDataState {
  refetch: () => Promise<void>;
}

export const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

interface GlobalDataProviderProps {
  children: ReactNode;
}

export function GlobalDataProvider({ children }: GlobalDataProviderProps) {
  const [state, setState] = useState<GlobalDataState>({
    peckyPrice: null,
    circulatingSupply: null,
    burnedPecky: null,
    nftPoolRemaining: null,
    activeNodes: [],
    isLoading: true,
    error: null,
  });

  const fetchGlobalData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [price, supply, burned, nftPool, nodes] = await Promise.all([
        fetchPeckyPrice(),
        fetchCirculatingSupply(),
        fetchBurnedPecky(),
        fetchNftPoolRemaining(),
        fetchActiveNodesSorted(),
      ]);

      setState({
        peckyPrice: price,
        circulatingSupply: supply,
        burnedPecky: burned,
        nftPoolRemaining: nftPool,
        activeNodes: nodes,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch global data';
      console.error('Failed to fetch global data:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchGlobalData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlobalDataContext.Provider
      value={{
        ...state,
        refetch: fetchGlobalData,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = React.useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}
