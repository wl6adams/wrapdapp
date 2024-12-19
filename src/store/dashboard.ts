import { create } from 'zustand';

import { Filters, TableData } from '@/shared/web3/types';

const FILTERS: Filters[] = [
  {
    name: '7d',
    value: 7,
    active: false,
  },
  {
    name: '1m',
    value: 30,
    active: true,
  },
];

type State = {
  viewPage: number;
  selectedPosition: number;
  selectedPositionLending: number;
  isLoading: boolean;
  reloadData: boolean;
  lendingCards: TableData[];
  filter: Filters[];
  sumData: number[];
  borrowedCards: TableData[];
};

type Actions = {
  setViewPage: (qty: number) => void;
  setSelectedPosition: (qty: number) => void;
  setSelectedPositionLending: (qty: number) => void;
  setReloadData: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setFilter: (filter: Filters[]) => void;
  setLendingCards: (TableData: TableData[]) => void;
  setBorrowedCards: (TableData: TableData[]) => void;
  setSumData: (number: number[]) => void;
};

export const useDashboardStore = create<State & Actions>((set) => ({
  viewPage: 0,
  selectedPositionLending: 0,
  selectedPosition: 0,
  filter: FILTERS,
  reloadData: false,
  isLoading: false,
  lendingCards: [],
  borrowedCards: [],
  sumData: [],
  setBorrowedCards: (TableData: TableData[]) => set(() => ({ borrowedCards: TableData })),
  setSumData: (number: number[]) => set(() => ({ sumData: number })),
  setLendingCards: (TableData: TableData[]) => set(() => ({ lendingCards: TableData })),
  setIsLoading: (bool: boolean) => set(() => ({ isLoading: bool })),
  setReloadData: (bool: boolean) => set(() => ({ reloadData: bool })),
  setViewPage: (qty: number) => set(() => ({ viewPage: qty })),
  setSelectedPosition: (qty: number) => set(() => ({ selectedPosition: qty })),
  setSelectedPositionLending: (qty: number) => set(() => ({ selectedPositionLending: qty })),
  setFilter: (filter: Filters[]) => set(() => ({ filter: filter })),
}));
