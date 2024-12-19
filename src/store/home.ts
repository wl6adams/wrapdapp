import { create } from 'zustand';

import { HomePageDataType } from '@/shared/web3/types';

type State = {
  isLoading: boolean;
  marketsData: HomePageDataType[];
};

type Actions = {
  setMarketsData: (data: HomePageDataType[]) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export const useStoreHome = create<State & Actions>((set) => ({
  marketsData: [],
  isLoading: false,
  setMarketsData: (data: HomePageDataType[]) => set(() => ({ marketsData: data })),
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),
}));
