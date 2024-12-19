'use client';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mainTheme } from '@/shared/chakra-ui';
import { config } from '@/shared/web3/wagmiConfig';

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={mainTheme}>{children}</ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { Providers };
