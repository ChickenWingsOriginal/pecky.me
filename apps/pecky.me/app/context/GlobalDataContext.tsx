'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { fetchPeckyPrice, fetchCirculatingSupply, fetchBurnedPecky, fetchNftPoolRemaining } from '@/app/lib/walletService';

export interface GlobalDataState {
  peckyPrice: number | null;
  circulatingSupply: bigint | null;
  burnedPecky: bigint | null;
  nftPoolRemaining: bigint | null;
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
    isLoading: true,
    error: null,
  });

  const fetchGlobalData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [price, supply, burned, nftPool] = await Promise.all([
        fetchPeckyPrice(),
        fetchCirculatingSupply(),
        fetchBurnedPecky(),
        fetchNftPoolRemaining(),
      ]);

      setState({
        peckyPrice: price,
        circulatingSupply: supply,
        burnedPecky: burned,
        nftPoolRemaining: nftPool,
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
