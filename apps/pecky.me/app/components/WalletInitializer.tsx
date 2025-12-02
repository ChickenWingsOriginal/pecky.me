'use client';

import { useWalletIntegration } from '@/app/hooks/useWalletIntegration';

/**
 * Component that initializes wallet integration
 * Must be placed inside WalletProvider and SupraConnectProvider
 */
export function WalletInitializer() {
  useWalletIntegration();

  // This component doesn't render anything, it just sets up the hooks
  return null;
}
