import { Address } from 'viem';

export type StatusResult = string;

export type ChartDataINT = {
  updatedAt: Date;
  accountings: {
    collateralBalanceUsd: string;
    timestamp: Date;
    totalBorrowUsd: string;
    totalSupply: string;
    totalSupplyUsd: string;
  }[];
};

export type AllTransactionsType = {
  network: number;
  time: string;
  amount: string;
  amountUsd: string;
  transactionHash: string;
  asset: Address;
  market: Address;
  operation: 'SUPPLY' | 'LEND' | 'BORROW';
};

export type AprTransactionType = {
  accounting: {
    netBorrowApr: string;
    netSupplyApr: string;
  };
  timestamp: string;
};

export type UserChartDataType = {
  balance: number;
  profit: string;
  date: Date;
};

export type UsersDataTypes = {
  transactions: AllTransactionsType[];
  networks: {
    [key: number]: {
      totalEarnUsd: string;
      totalRewards: string;
      totalRewardsUsd: string;
      markets: {
        [key: string]: {
          charts: {
            baseAssetBalance: UserChartDataType[];
            totalEarn: UserChartDataType[];
          };
          profit: string;
          profitUsd: string;
        };
      };
    };
  };
};

export type AllUsersDataTypes = {
  [key: string]: UsersDataTypes;
};
