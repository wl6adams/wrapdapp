import { create } from 'zustand';

export type TransactionData = {
  collateral: string;
  market: string;
  network: number;
  date: number;
  event: string;
  from: string;
  to: string;
  value: bigint;
  hash: string;
};

export type TransactionsType = {
  [key: string]: TransactionData[];
};

type State = {
  isLoading: boolean;
  isLoadingEnd: boolean;
  transaction: TransactionsType;
  rewards: TransactionsType;
};

type Actions = {
  setIsLoadingEnd: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setTransaction: (transaction: TransactionsType) => void;
  setRewards: (transaction: TransactionsType) => void;
};

export const useTransactions = create<State & Actions>((set) => ({
  isLoading: true,
  isLoadingEnd: false,
  transaction: {},
  rewards: {},
  setIsLoading: (bool) => set(() => ({ isLoading: bool })),
  setIsLoadingEnd: (bool) => set(() => ({ isLoadingEnd: bool })),
  setTransaction: (trans: TransactionsType) =>
    set((state) => {
      if (state.transaction) {
        return { transaction: { ...state.transaction, ...trans } };
      } else {
        return { transaction: trans };
      }
    }),

  setRewards: (trans: TransactionsType) =>
    set((state) => {
      if (state.rewards) {
        return { rewards: { ...state.rewards, ...trans } };
      } else {
        return { rewards: trans };
      }
    }),
}));
