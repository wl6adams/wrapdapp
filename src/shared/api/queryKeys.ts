import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll, sepolia } from 'wagmi/chains';

import {
  getArbitrumAPR,
  getBaseAPR,
  getMainnetAPR,
  getMantleAPR,
  getOptimismAPR,
  getPolygonAPR,
  getScrollAPR,
} from './api';
import { AprTransactionType } from './types';

export const QUERY_KEYS = {
  getChartData: 'getChartData',
  getAllTransactions: 'getAllTransactions',
  getUsersUrls: 'getUsersUrls',
  getChainAPR: 'getChainAPR',
} as const;

export type ApiPromiseType = {
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
};

export const API_QUERY_KEYS_CHAIN_APR: Record<
  number,
  {
    QUERY_KEYS: string;
    API: () => Promise<ApiPromiseType>;
  }
> = {
  [sepolia.id]: {
    QUERY_KEYS: 'getSepoliaAPR',
    API: getScrollAPR,
  },
  [mainnet.id]: {
    QUERY_KEYS: 'getMainnetAPR',
    API: getMainnetAPR,
  },
  [polygon.id]: {
    QUERY_KEYS: 'getPolygonAPR',
    API: getPolygonAPR,
  },
  [arbitrum.id]: {
    QUERY_KEYS: 'getArbitrumAPR',
    API: getArbitrumAPR,
  },
  [base.id]: {
    QUERY_KEYS: 'getBaseAPR',
    API: getBaseAPR,
  },
  [scroll.id]: {
    QUERY_KEYS: 'getScrollAPR',
    API: getScrollAPR,
  },
  [optimism.id]: {
    QUERY_KEYS: 'getOptimismAPR',
    API: getOptimismAPR,
  },
  [mantle.id]: {
    QUERY_KEYS: 'getMantleAPR',
    API: getMantleAPR,
  },
};
