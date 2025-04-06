"use client";

import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for React Query
const queryClient = new QueryClient();

// Use a hardcoded projectId for development
// For production, this should come from environment variables
const FALLBACK_PROJECT_ID = "27cb6062bd58e74a6db165f1fbebb9ee";

// Ensure projectId is always a valid string, defaulting robustly
let projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || FALLBACK_PROJECT_ID;
if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
  console.warn('WalletConnect Project ID from env is missing or invalid. Using fallback.');
  // Assign fallback explicitly if env var is invalid
  projectId = FALLBACK_PROJECT_ID;
}

// Configure wagmi with RainbowKit's config
const config = getDefaultConfig({
  appName: 'ABSTRACTU',
  projectId: projectId,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  // Prevent SSR issues
  ssr: true,
});

/**
 * Web3 wallet provider for the application
 */
export default function WalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Wait for client-side rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple passthrough if not yet mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#FFD700', // Gold accent color
            accentColorForeground: '#000000',
            borderRadius: 'small',
            fontStack: 'system',
          })}
          showRecentTransactions={false}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 