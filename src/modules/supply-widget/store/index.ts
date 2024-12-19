import { mainnet, sepolia } from 'wagmi/chains';
import { create } from 'zustand';

import { contractsConfig, NetworksNames } from '@/shared/web3/chainConfig';
import { ConfigTypesSupply, TableData } from '@/shared/web3/types';

type State = {
  showStep: number;
  inputValue: string;
  amount: string;
  currentNetwork: number;
  currentTokenData: ConfigTypesSupply;
  tokenName: string;
  networkName: string;
  isLoadingTransaction: boolean;
  isAfterApprove: boolean;
  isNotEnough: boolean;
  isChecked: boolean;
  selectedMarketData?: TableData;
  maxFeePerGas: bigint;
  estimateGas: bigint;
};

type Actions = {
  setCurrentTokenData: (data: ConfigTypesSupply) => void;
  setTokenCount: (qty: string) => void;
  setShowStep: (qty: number) => void;
  setCurrentNetwork: (qty: number) => void;
  setTokenName: (name: string) => void;
  setNetworkName: (name: string) => void;
  setAmount: (amount: string) => void;
  reset: () => void;
  setIsChecked: (bool: boolean) => void;
  setIsNotEnough: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setIsAfterApprove: (bool: boolean) => void;
  setSelectedMarketData: (data: TableData) => void;
  setMaxFeePerGas: (data: bigint) => void;
  setEstimateGas: (data: bigint) => void;
};

export const useStore = create<State & Actions>((set) => ({
  maxFeePerGas: BigInt(0),
  estimateGas: BigInt(0),
  showStep: 1,
  amount: '',
  inputValue: '',
  currentNetwork: mainnet.id,
  currentTokenData: contractsConfig.token[sepolia.id].USDC,
  tokenName: 'USDC',
  networkName: NetworksNames[sepolia.id],
  isChecked: true,
  isAfterApprove: false,
  isNotEnough: false,
  isLoadingTransaction: false,
  selectedMarketData: undefined,
  setEstimateGas: (data) => set(() => ({ estimateGas: data })),
  setMaxFeePerGas: (data) => set(() => ({ maxFeePerGas: data })),
  setSelectedMarketData: (data: TableData) => set(() => ({ selectedMarketData: data })),
  setIsNotEnough: (bool: boolean) => set(() => ({ isNotEnough: bool })),
  setIsChecked: (bool: boolean) => set(() => ({ isChecked: bool })),
  setIsAfterApprove: (bool: boolean) => set(() => ({ isAfterApprove: bool })),
  setIsLoading: (bool: boolean) => set(() => ({ isLoadingTransaction: bool })),
  setCurrentTokenData: (data: ConfigTypesSupply) => set(() => ({ currentTokenData: data })),
  setTokenName: (name: string) => set(() => ({ tokenName: name })),
  setNetworkName: (name: string) => set(() => ({ networkName: name })),
  setShowStep: (qty: number) => set(() => ({ showStep: qty })),
  setTokenCount: (qty: string) => set(() => ({ inputValue: qty })),
  setAmount: (amount: string) => set(() => ({ amount })),
  setCurrentNetwork: (qty: number) => set(() => ({ currentNetwork: qty })),
  reset: () => set(() => ({ inputValue: '' })),
}));
