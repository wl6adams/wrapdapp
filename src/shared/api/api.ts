import axios from 'axios';

import { AllTransactionsType, AllUsersDataTypes, AprTransactionType, ChartDataINT } from './types';

export const getChartData = (): Promise<ChartDataINT> =>
  axios
    .get('/ipfs/?path=QmZNw48DnPJ3JU7iXGTQGRRptDWdKPtANCFTMB6V4K8V8P', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getAllTransactions = (): Promise<{
  updatedAt: Date;
  transactionsHistory: Record<string, AllTransactionsType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmZqpyDmSCdCxRjHPUYRNiSTnZ9QUJfRXjUvAR5pophHaC', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const findUserIpfsHash = (): Promise<{
  [key: string]: string[];
}> =>
  axios
    .get('/ipfs/?path=QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getUserData = (hash: string): Promise<AllUsersDataTypes> =>
  axios
    .get(`/ipfs/?path=${hash}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getScrollAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmYfwTbgfVktmS11NDqSY7nHXNxdVUAqegm6dWpQt7vbEL', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getTestAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmQdZCnczwfyxSJQ4GyMEyKbXhuWUK3tXuBJ1LGeAQMhxi', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getPolygonAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmP7NpXjXKq9LC9NSAw5AACdhan6uN2WoowMtMiWHFYtBj', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getOptimismAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmZLLfQvFZqVTQsvzGFN5ZkWHt9SCKyiYXfUvSec6moEGY', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getMainnetAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmXax99nxAcmbbXMsjNvwq9Hx9nCCtT2CpCxqKcxRCyZh7', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getBaseAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmfHdX536V2NZSCsyjsiBi6tMsyqANQcFi1mnpy1yMTA24', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getArbitrumAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmVse43ioW8gHndcTThi88Yuk2KerkDfNWLUyJyMMRhaWe', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);

export const getMantleAPR = (): Promise<{
  networkId: number;
  updatedAt: Date;
  markets: Record<string, AprTransactionType[]>;
}> =>
  axios
    .get('/ipfs/?path=QmXDrkoffsUwTQjA6E8MhfmPUXfiw72vHWz4SDZjL83zX9', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      timeout: 10000,
    })
    .then((r) => r.data);
