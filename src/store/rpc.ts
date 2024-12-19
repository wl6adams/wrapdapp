import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll } from 'wagmi/chains';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CustomRPCListType = {
  name: string;

  id: number;

  icon: string;

  value: string;

  isArchiveNode: boolean;
};

interface State {
  publicRPC: boolean;

  myWalletRPC: boolean;

  customRPC: boolean;

  lastChange: number;

  customRPCList: CustomRPCListType[];
}

interface Actions {
  setPublicRPC: (publicRPC: boolean) => void;

  setMyWalletRPC: (myWalletRPC: boolean) => void;

  setCustomRPC: (customRPC: boolean) => void;

  setCustomRPCList: (list: CustomRPCListType[]) => void;
}

const RPC_LIST = [
  {
    name: 'Ethereum',
    id: mainnet.id,
    icon: '/markets/ethereum.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Optimism',
    id: optimism.id,
    icon: '/markets/optimism.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Polygon',
    id: polygon.id,
    icon: '/markets/polygon.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Arbitrum',
    id: arbitrum.id,
    icon: '/markets/arbitrum.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Base',
    id: base.id,
    icon: '/markets/base.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Scroll',
    id: scroll.id,
    icon: '/markets/scroll.svg',
    value: '',
    isArchiveNode: false,
  },
  {
    name: 'Mantle',
    id: mantle.id,
    icon: '/markets/mantle.svg',
    value: '',
    isArchiveNode: false,
  },
];

export const useRPCStore = create<State & Actions>()(
  persist(
    (set) => ({
      lastChange: 0,
      publicRPC: true,
      myWalletRPC: false,
      customRPC: false,
      customRPCList: RPC_LIST,

      setPublicRPC: (publicRPC) =>
        set({ publicRPC, myWalletRPC: false, customRPC: false, lastChange: 1 }),
      setMyWalletRPC: (myWalletRPC) =>
        set({ publicRPC: false, myWalletRPC, customRPC: false, lastChange: 2 }),
      setCustomRPC: (customRPC) =>
        set({ publicRPC: false, myWalletRPC: false, customRPC, lastChange: 3 }),
      setCustomRPCList: (list) => set({ customRPCList: list, lastChange: 4 }),
    }),
    {
      name: 'rpc-storage',
      version: 1.04,
      getStorage: () => localStorage,
    }
  )
);

export type { CustomRPCListType };
