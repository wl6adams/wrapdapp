import create from 'zustand';
import { persist } from 'zustand/middleware';

import { CompTotalData } from '@/shared/web3/types';

type State = {
  totalCompData: CompTotalData[];
  lastTimeStamp: number;
  userAddress: string;
};

type Actions = {
  setTotalCompData: (data: CompTotalData[]) => void;
  seLastTimeStamp: (data: number) => void;
  setUserAddress: (data: string) => void;
};

const useCompEarnedStore = create<State & Actions>()(
  persist(
    (set) => ({
      totalCompData: [],
      lastTimeStamp: 0,
      userAddress: '0',
      setTotalCompData: (data) => set(() => ({ totalCompData: data })),
      seLastTimeStamp: (data) => set(() => ({ lastTimeStamp: data })),
      setUserAddress: (data) => set(() => ({ userAddress: data })),
    }),
    {
      name: 'comp-earned',
      getStorage: () => localStorage,
    }
  )
);

export default useCompEarnedStore;
