import { createConfig, fallback, http } from 'wagmi';
import {
  arbitrum,
  base,
  Chain,
  mainnet,
  mantle,
  optimism,
  polygon,
  scroll,
  sepolia,
} from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from '@wagmi/connectors';
import { injected } from '@wagmi/core';

import { INFURA } from '@/shared/consts/constant';

export const supportedChains: readonly [Chain, ...Chain[]] = [
  sepolia,
  mainnet,
  polygon,
  arbitrum,
  base,
  optimism,
  scroll,
  mantle,
];

export const DEFAULT_CHAIN_ID = supportedChains[1].id;

export const supportedChainsId = supportedChains.map((chain) => chain.id);

const connectors =
  typeof window !== 'undefined'
    ? [
        metaMask(),
        injected({
          target() {
            return {
              id: 'okxDefi',
              name: 'Okx Defi',
              provider: window?.okxwallet,
            };
          },
          shimDisconnect: true,
        }),
        injected({
          target() {
            return {
              id: 'rabby',
              name: 'Rabby Wallet',
              provider: window?.rabby,
            };
          },
          shimDisconnect: true,
        }),
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
          qrModalOptions: {
            themeMode: 'dark',
            enableExplorer: true,
          },
        }),
        coinbaseWallet({
          appName: 'Compound',
          appLogoUrl: 'https://app.compound.finance/images/assets/asset_COMP.svg',
        }),
      ]
    : [];

export const config: any = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base, optimism, scroll, mantle],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(INFURA && `https://sepolia.infura.io/v3/${INFURA}`),
    [mainnet.id]: fallback([
      http(),
      http('https://rpc.mevblocker.io'),
      http('https://ethereum-rpc.publicnode.com'),
      http('https://eth.rpc.blxrbdn.com'),
      http('https://rpc.ankr.com/eth'),
    ]),
    [polygon.id]: fallback([
      http(),
      http('https://polygon.blockpi.network/v1/rpc/public'),
      http('https://polygon.blockpi.network/v1/rpc/public'),
      http('https://polygon-bor-rpc.publicnode.com'),
      http('https://rpc.ankr.com/polygon'),
    ]),
    [arbitrum.id]: fallback([
      http(),
      http('https://1rpc.io/arb'),
      http('https://arbitrum.meowrpc.com'),
      http('https://arbitrum-one.public.blastapi.io'),
    ]),
    [base.id]: fallback([
      http(),
      http('https://mainnet.base.org'),
      http('https://base.drpc.org'),
      http('https://base.blockpi.network/v1/rpc/public'),
      http('https://base-mainnet.public.blastapi.io'),
    ]),
    [optimism.id]: fallback([
      http(),
      http('https://mainnet.optimism.io'),
      http('https://optimism.rpc.subquery.network/public'),
      http('https://op-pokt.nodies.app'),
      http('https://optimism.gateway.tenderly.co'),
    ]),
    [scroll.id]: fallback([
      http(),
      http('https://rpc.scroll.io'),
      http('https://scroll-rpc.publicnode.com'),
      http('https://1rpc.io/scroll'),
      http('https://scroll-mainnet.public.blastapi.io'),
    ]),
    [mantle.id]: fallback([
      http(),
      http('https://rpc.mantle.xyz'),
      http('https://mantle-mainnet.public.blastapi.io'),
      http('https://mantle-rpc.publicnode.com'),
      http('https://mantle-mainnet.public.blastapi.io'),
    ]),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

declare global {
  interface Window {
    okxwallet: any;
    rabby: any;
  }

  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};
