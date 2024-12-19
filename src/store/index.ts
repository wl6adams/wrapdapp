import { create } from 'zustand';

import { AllCollateralData, collateralsInputsData, TableData } from '@/shared/web3/types';

type State = {
  compoundPrice: number;
  showStep: number;
  liqRisk: number;
  inputValue: string;
  txHash: string;
  isLoadingTransaction: boolean;
  isAfterApprove: boolean;
  isNotEnough: boolean;
  isMyWallet: boolean;
  isAddressData: boolean;
  allMarketsData: TableData[];
  selectedMarketData?: TableData;
  collateralsData: AllCollateralData[];
  collateralsInputs: {
    lastValue: number;
    collateralsInputsData: collateralsInputsData[];
  };
};

type Actions = {
  setCompoundPrice: (qty: number) => void;
  setTokenCount: (qty: string) => void;
  setTxHash: (hash: string) => void;
  setShowStep: (qty: number) => void;
  setLiqRisk: (qty: number) => void;
  reset: () => void;
  setIsNotEnough: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setIsAfterApprove: (bool: boolean) => void;
  setIsMyWallet: (bool: boolean) => void;
  setIsAddressData: (bool: boolean) => void;
  setCollateralsData: (data: AllCollateralData[]) => void;
  setAllMarketsData: (data: TableData[]) => void;
  setSelectedMarketData: (data: TableData) => void;
  setCollateralsInputs: (data: {
    lastValue: number;
    collateralsInputsData: collateralsInputsData[];
  }) => void;
};

export const useStore = create<State & Actions>((set) => ({
  compoundPrice: 0,
  showStep: 1,
  inputValue: '',
  isAfterApprove: false,
  isNotEnough: false,
  isLoadingTransaction: false,
  isMyWallet: false,
  isAddressData: false,
  allMarketsData: [],
  collateralsData: [],
  collateralsInputs: {
    lastValue: 0,
    collateralsInputsData: [],
  },
  selectedMarketData: undefined,
  liqRisk: 1.5,
  txHash: '',
  setAllMarketsData: (TableData: TableData[]) => set(() => ({ allMarketsData: TableData })),
  setTxHash: (txHash: string) => set(() => ({ txHash: txHash })),
  setLiqRisk: (num: number) => set(() => ({ liqRisk: num })),
  setCompoundPrice: (num: number) => set(() => ({ compoundPrice: num })),
  setCollateralsInputs: (data: {
    lastValue: number;
    collateralsInputsData: collateralsInputsData[];
  }) => set(() => ({ collateralsInputs: data })),
  setSelectedMarketData: (data: TableData) => set(() => ({ selectedMarketData: data })),
  setCollateralsData: (data: AllCollateralData[]) => set(() => ({ collateralsData: data })),
  setIsAddressData: (bool: boolean) => set(() => ({ isAddressData: bool })),
  setIsMyWallet: (bool: boolean) => set(() => ({ isMyWallet: bool })),
  setIsNotEnough: (bool: boolean) => set(() => ({ isNotEnough: bool })),
  setIsAfterApprove: (bool: boolean) => set(() => ({ isAfterApprove: bool })),
  setIsLoading: (bool: boolean) => set(() => ({ isLoadingTransaction: bool })),
  setShowStep: (qty: number) => set(() => ({ showStep: qty })),
  setTokenCount: (qty: string) => set(() => ({ inputValue: qty })),
  reset: () => set(() => ({ inputValue: '' })),
}));
