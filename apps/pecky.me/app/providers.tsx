'use client';

import { SupraConnectProvider } from '@gerritsen/supra-connect';
import '@gerritsen/supra-connect/styles.css';
import { WalletProvider } from '@/app/context/WalletContext';
import { GlobalDataProvider } from '@/app/context/GlobalDataContext';
import { WalletInitializer } from '@/app/components/WalletInitializer';
import { ToastProvider } from '@/app/components/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupraConnectProvider>
      <GlobalDataProvider>
        <WalletProvider>
          <ToastProvider />
          <WalletInitializer />
          {children}
        </WalletProvider>
      </GlobalDataProvider>
    </SupraConnectProvider>
  );
}