import { HttpTransport } from 'viem';
import { createConfig, fallback, http, unstable_connector } from 'wagmi';
import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from '@wagmi/connectors';
import { injected } from '@wagmi/core';

import { CustomRPCListType } from '@/store/rpc';

export const useArchiveConfig: any = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism, scroll, mantle],
  transports: {
    [mainnet.id]: fallback([
      http('https://normally-up-yeti.n0des.xyz'),
      http('https://eth.drpc.org'),
    ]),
    [polygon.id]: fallback([
      http('https://polygon-rpc.com'),
      http('https://remarkably-flowing-anchovy.n0des.xyz'),
    ]),
    [arbitrum.id]: fallback([
      http('https://arb-pokt.nodies.app'),
      http('https://presently-upright-man.n0des.xyz'),
      http(
        'https://rpc.ankr.com/arbitrum/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
      ),
    ]),
    [base.id]: fallback([http('https://conversely-ethical-falcon.n0des.xyz')]),
    [optimism.id]: fallback([
      http('https://easily-infinite-haddock.n0des.xyz'),
      http('https://go.getblock.io/1ac8b15e108640d9aba7594c2663acb8/'),
    ]),
    [scroll.id]: fallback([
      http(
        'https://rpc.ankr.com/scroll/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
      ),
    ]),
    [mantle.id]: fallback([
      http(
        'https://rpc.ankr.com/mantle/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
      ),
    ]),
  },
});

const getRPCValue = (rpcList: CustomRPCListType[], chainId: number, defaultValue?: string) => {
  return rpcList.find(({ id, value }) => id === chainId && value !== '')?.value || defaultValue;
};

export const useCustomArchiveConfig: any = (rpcList: CustomRPCListType[]) => {
  return createConfig({
    chains: [mainnet, polygon, arbitrum, base, optimism, scroll, mantle],
    transports: {
      [mainnet.id]: fallback([
        http(getRPCValue(rpcList, mainnet.id, 'https://normally-up-yeti.n0des.xyz')),
        http('https://eth.drpc.org'),
      ]),
      [polygon.id]: fallback([
        http(getRPCValue(rpcList, polygon.id, 'https://polygon-rpc.com')),
        http('https://remarkably-flowing-anchovy.n0des.xyz'),
      ]),
      [arbitrum.id]: fallback([
        http(getRPCValue(rpcList, arbitrum.id, 'https://presently-upright-man.n0des.xyz')),
        http('https://arb-pokt.nodies.app'),
        http(
          'https://rpc.ankr.com/arbitrum/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
        ),
      ]),
      [base.id]: fallback([
        http(getRPCValue(rpcList, base.id, 'https://conversely-ethical-falcon.n0des.xyz')),
        http('https://1rpc.io/33x7mkzEHjv3AvFNX/base'),
      ]),
      [optimism.id]: fallback([
        http(getRPCValue(rpcList, optimism.id, 'https://easily-infinite-haddock.n0des.xyz')),
        http('https://go.getblock.io/1ac8b15e108640d9aba7594c2663acb8/'),
      ]),
      [scroll.id]: fallback([
        http(
          getRPCValue(
            rpcList,
            scroll.id,
            'https://rpc.ankr.com/scroll/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
          )
        ),
      ]),
      [mantle.id]: fallback([
        http(
          getRPCValue(
            rpcList,
            mantle.id,
            'https://rpc.ankr.com/mantle/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591'
          )
        ),
      ]),
    },
  });
};

const defaultRPC: { [key: number]: HttpTransport[] } = {
  [mainnet.id]: [
    http('https://rpc.mevblocker.io'),
    http('https://ethereum-rpc.publicnode.com'),
    http('https://eth.rpc.blxrbdn.com'),
    http('https://rpc.ankr.com/eth'),
  ],
  [polygon.id]: [
    http('https://polygon.blockpi.network/v1/rpc/public'),
    http('https://polygon.blockpi.network/v1/rpc/public'),
    http('https://polygon-bor-rpc.publicnode.com'),
    http('https://rpc.ankr.com/polygon'),
  ],
  [arbitrum.id]: [
    http('https://1rpc.io/arb'),
    http('https://arbitrum.meowrpc.com'),
    http('https://arbitrum-one.public.blastapi.io'),
  ],
  [base.id]: [
    http('https://mainnet.base.org'),
    http('https://base.drpc.org'),
    http('https://base.blockpi.network/v1/rpc/public'),
    http('https://base-mainnet.public.blastapi.io'),
    http('https://base.llamarpc.com'),
    http('https://1rpc.io/base'),
  ],
  [optimism.id]: [
    http('https://mainnet.optimism.io'),
    http('https://optimism.rpc.subquery.network/public'),
    http('https://op-pokt.nodies.app'),
    http('https://optimism.gateway.tenderly.co'),
  ],
  [scroll.id]: [
    http('https://rpc.scroll.io'),
    http('https://scroll-rpc.publicnode.com'),
    http('https://1rpc.io/scroll'),
    http('https://scroll-mainnet.public.blastapi.io'),
  ],
  [mantle.id]: [
    http('https://rpc.mantle.xyz'),
    http('https://mantle-mainnet.public.blastapi.io'),
    http('https://mantle-rpc.publicnode.com'),
    http('https://mantle-mainnet.public.blastapi.io'),
  ],
};

export const useDefaultConfig: any = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism, scroll, mantle],
  transports: {
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
      http('https://base.llamarpc.com'),
      http('https://1rpc.io/base'),
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

const walletsTransports = [
  unstable_connector(metaMask),
  unstable_connector(walletConnect),
  http(),
  unstable_connector(coinbaseWallet),
  unstable_connector(injected),
];

export const useWalletConfig: any = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism, scroll, mantle],
  transports: {
    [mainnet.id]: fallback(walletsTransports),
    [polygon.id]: fallback(walletsTransports),
    [arbitrum.id]: fallback(walletsTransports),
    [base.id]: fallback(walletsTransports),
    [optimism.id]: fallback(walletsTransports),
    [scroll.id]: fallback(walletsTransports),
    [mantle.id]: fallback(walletsTransports),
  },
});

export const useCustomConfig = (rpcList: CustomRPCListType[]) => {
  const chainRPCs = {
    [mainnet.id]: getRPCValue(rpcList, mainnet.id),
    [polygon.id]: getRPCValue(rpcList, polygon.id),
    [arbitrum.id]: getRPCValue(rpcList, arbitrum.id),
    [base.id]: getRPCValue(rpcList, base.id),
    [optimism.id]: getRPCValue(rpcList, optimism.id),
    [scroll.id]: getRPCValue(rpcList, scroll.id),
    [mantle.id]: getRPCValue(rpcList, mantle.id),
  };

  const transports: any = Object.entries(chainRPCs).reduce(
    (acc, [chainId, value]) => {
      acc[chainId] = fallback(value ? [http(value)] : [...defaultRPC[Number(chainId)]]);
      return acc;
    },
    {} as Record<string, any>
  );

  return createConfig({
    chains: [mainnet, polygon, arbitrum, base, optimism, scroll, mantle],
    transports,
  });
};

export const getRPCConfig = (
  address: string | undefined,
  publicRPC: boolean,
  myWalletRPC: boolean,
  customRPC: boolean,
  lastChange: number,
  customRPCList: CustomRPCListType[]
) => {
  if (!address || publicRPC) {
    return useDefaultConfig;
  }
  if (myWalletRPC) {
    return useWalletConfig;
  }
  if (customRPC && lastChange > 3) {
    return useCustomConfig(customRPCList);
  }
  return useDefaultConfig;
};

export const getArchiveRpcConfig = (
  customRPC: boolean,
  lastChange: number,
  customRPCList: CustomRPCListType[]
) => {
  if (customRPC && lastChange > 3) {
    return useCustomArchiveConfig(customRPCList);
  }
  return useArchiveConfig;
};
