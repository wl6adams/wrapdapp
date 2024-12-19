import create from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartDataType = {
  balance: number;
  balanceSecond: number;
  balanceToken: bigint;
  timestamp: number;
  getDataTimeStamp: number;
  networkId: number;
  address: string;
};

type State = {
  chartData: {
    [user: string]: {
      [key: string]: ChartDataType[];
    };
  };
};

type Actions = {
  setChartData: (data: {
    [user: string]: {
      [key: string]: ChartDataType[];
    };
  }) => void;
};

const useBaseAssetChartStore = create<State & Actions>()(
  persist(
    (set) => ({
      chartData: {},
      setChartData: (data) => set(() => ({ chartData: data })),
    }),
    {
      name: 'base-asset-chart',
      version: 1.07,
      getStorage: () => localStorage,
    }
  )
);

export default useBaseAssetChartStore;
