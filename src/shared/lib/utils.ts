import { ethers, providers } from 'ethers';
import { Address, Chain, Client, formatUnits, parseUnits, Transport } from 'viem';
import { sepolia } from 'wagmi/chains';
import { Config, estimateGas, getClient } from '@wagmi/core';

import {
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_SUPPLY_TOKEN,
  DirectionType,
} from '@/shared/consts/constant';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { RewardsABI } from '@/shared/web3/abi/RewardsABI';
import { REWARDS_ADDRESSES } from '@/shared/web3/config';
import { priceFeedMantissa } from '@/shared/web3/hook/getMarketData';
import { averageBlockTime } from '@/shared/web3/hook/getUserTransactions';
import { AllCollateralData, SortConfigType, TableData } from '@/shared/web3/types';
import { TransactionData } from '@/store/transaction';

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
};

export const formatSliceNumber = (value: string, maxDecimals: number = 2) => {
  const [integerPart] = value.split('.');

  return value.slice(0, maxDecimals + integerPart.length + 1);
};

export const formatSliceTokenOrUSD = (value: string, maxDecimals: number = 2): string => {
  const minValue = +`0.${'0'.repeat(maxDecimals - 1)}1`;

  return Number(value) < minValue && Number(value) !== 0
    ? `<${minValue}`
    : formatSliceNumber(value, maxDecimals);
};

export const sliceAddress = (address?: string, before: number = 4, after: number = 4) => {
  return address && `${address.slice(0, before)}...${address.slice(-after)}`;
};

export const getBigNumber = (number?: string, decimals: number = 18) => {
  if (number) {
    return parseUnits(number, decimals);
  }
  return BigInt(0);
};

export const nf = new Intl.NumberFormat('en-US');

export const getUSDFormat = (
  value: bigint | undefined,
  decimals: number | undefined = 18,
  digits: number = 2
) => {
  if (!value) return '$0.00';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });

  return formatter.format(Number(formatUnits(value, decimals)));
};

export const getSliderColor = (value: number) => {
  switch (true) {
    case value <= 1.1:
      return '#F53F3B';

    case value <= 1.25:
      return '#FB8324';

    case value <= 1.4:
      return '#FFB016';

    default:
      return '#25FFBF';
  }
};

export const formatCommaNumber = (value: string, maxDecimals: number = 2) => {
  if (!value) return '';

  const [integerPart, decimalPart] = value.split('.');
  if (decimalPart && decimalPart.length > maxDecimals) {
    const trueDecimal = decimalPart.slice(0, maxDecimals);
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${trueDecimal}`;
  }
  if (decimalPart) {
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalPart}`;
  }
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formattedDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const removeSepoliaFromTable = (data: TableData[]) => {
  return data.filter(({ chainId }) => chainId !== sepolia.id);
};

export const findCollateralByHealthFactor = ({
  borrowUSD,
  marketPrice,
  healthFactor,
  liqFactor,
  collateralPrice,
}: {
  borrowUSD: number;
  healthFactor: number;
  liqFactor: number;
  marketPrice: number;
  collateralPrice?: number;
}) => {
  const resultUSD = (borrowUSD * healthFactor) / liqFactor;

  return resultUSD / (collateralPrice || marketPrice);
};

export const findHealthFactorByCollateralInput = ({
  borrowAmount,
  borrowPrice,
  liqFactor,
  collateralValue,
  collateralPrice,
}: {
  borrowAmount: number;
  borrowPrice: number;
  liqFactor: number;
  collateralValue: number;
  collateralPrice: number;
}) => {
  const borrowAmountUSD = borrowAmount * borrowPrice;

  const collateralUSD = collateralValue * collateralPrice;

  return (collateralUSD * liqFactor) / borrowAmountUSD;
};

export const getTokenPrice = (symbol: string, tokenPrice: bigint, marketPrice: number): number => {
  return symbol === 'ETH' || symbol === 'wstETH'
    ? Number(formatUnits(tokenPrice, priceFeedMantissa)) * marketPrice
    : Number(formatUnits(tokenPrice, priceFeedMantissa));
};

export const sortTable = (
  key: keyof TableData,
  direction: DirectionType = 'ascending',
  sortConfig: SortConfigType,
  setSortConfig: (data: SortConfigType) => void
) => {
  if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
    setSortConfig(null);

    return;
  }

  if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
    direction = 'ascending';
  }

  setSortConfig({ key, direction });
};

export const sortedDataFunc = (data: TableData[], sortConfig: SortConfigType) => {
  return [...data].sort((a, b) => {
    if (sortConfig !== null) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }

      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }

    return 0;
  });
};

export const convertTime = (value: number, unit: 'minutes' | 'hours' | 'days') => {
  if (value < 0) return 0;

  switch (unit) {
    case 'minutes':
      return value * 60 * 1000;

    case 'hours':
      return value * 60 * 60 * 1000;

    case 'days':
      return value * 24 * 60 * 60 * 1000;

    default:
      return 0;
  }
};

export const clientToProvider = (client: Client<Transport, Chain>) => {
  const { chain, transport } = client;

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );

  return new providers.JsonRpcProvider(transport.url, network);
};

export const getEthersProvider = (config: Config, { chainId }: { chainId?: number } = {}) => {
  const client = getClient(config, { chainId });

  if (!client) return;

  return clientToProvider(client);
};

export const multiplyByPercent = (value: bigint, percent: bigint) =>
  value + (value * percent) / BigInt(100);

export const cleanNumber = (input: string) => {
  return input
    .replace(/[,.]/g, '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*?)\..*/g, '$1');
};

export const removeCommas = (input: string): string => input.replace(/,/g, '');

export const cleanNumericString = (input: string): string =>
  input.replace(/,/g, '').replace(/^0+(?=\d)/, '');

export const isValidNumericInput = (input: string): boolean => /^\d*\.?\d*$/.test(input);

export const formatToDecimalsWithCommas = (value: string, decimals: number): string =>
  formatCommaNumber(value, decimals);

export const trimToDecimals = (value: string, decimals: number): string =>
  formatSliceNumber(value, decimals);

export const getLendTransactionFee = async (
  currentNetwork: number,
  decimals: number,
  addressTo: Address,
  addressFrom: Address,
  bulkerAddress: Address,
  address: Address,
  userEthBalance: bigint,
  isNative: boolean,
  inputValue: string,
  isNeedApprove: boolean,
  isAllowed: boolean | undefined,
  config: any
) => {
  if (inputValue === '') {
    return {
      estimateGas: BigInt(0),
    };
  }
  const dataContract = [addressTo, address, userEthBalance];
  const dataTokenContract = [addressTo, address, addressFrom, getBigNumber(inputValue, decimals)];

  const supplyWETH = ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'uint'],
    dataContract
  ) as '0xstring';

  const supplyToken = ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'address', 'uint'],
    dataTokenContract
  ) as `0x${string}`;

  const iFaceTokenAllow = new ethers.utils.Interface(CometABI);
  const iFaceTokenApprove = new ethers.utils.Interface(ERC20ABI);
  const iFaceBulker = new ethers.utils.Interface(BulkerABI);

  const actions: `0x${string}` = isNative ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN;
  const data: `0x${string}` = isNative ? supplyWETH : supplyToken;

  const encodedCallNative = iFaceBulker.encodeFunctionData('invoke', [
    [actions],
    [data],
  ]) as '0xstring';

  const encodedCallTokenAllow = iFaceTokenAllow.encodeFunctionData('allow', [
    bulkerAddress,
    true,
  ]) as '0xstring';

  const encodedCallTokenApprove = iFaceTokenApprove.encodeFunctionData('approve', [
    addressTo,
    getBigNumber(inputValue, decimals),
  ]) as '0xstring';

  const parameters = !isAllowed
    ? {
        account: address,
        chainId: currentNetwork,
        data: encodedCallTokenAllow,
        to: addressTo,
      }
    : !isNative
      ? {
          account: address,
          chainId: currentNetwork,
          data: isNeedApprove ? encodedCallTokenApprove : encodedCallNative,
          to: isNeedApprove ? addressFrom : bulkerAddress,
        }
      : {
          account: address,
          chainId: currentNetwork,
          data: encodedCallNative,
          to: bulkerAddress,
          value: userEthBalance,
        };
  const result = await estimateGas(config, parameters);

  return {
    estimateGas: result + (result * BigInt(15)) / BigInt(100),
  };
};

export const sortCollateralsByBalanceAndSymbol = (
  allCollaterals: AllCollateralData[]
): AllCollateralData[] => {
  const ethRegex = /ETH/;

  const nonZeroBalance = allCollaterals.filter((asset) => asset.balanceOf > BigInt(0));
  let zeroBalance = allCollaterals.filter((asset) => asset.balanceOf === BigInt(0));

  nonZeroBalance.sort((a, b) => Number(b.balanceOf - a.balanceOf));

  const ethIndex = nonZeroBalance.findIndex((asset) => asset.symbol === 'ETH');

  if (ethIndex !== -1) {
    const [ethToken] = nonZeroBalance.splice(ethIndex, 1);

    nonZeroBalance.push(ethToken);
  }

  const ethRelatedTokens = zeroBalance.filter((asset) => ethRegex.test(asset.symbol));

  zeroBalance = zeroBalance.filter((asset) => !ethRegex.test(asset.symbol));

  return [...nonZeroBalance, ...ethRelatedTokens, ...zeroBalance];
};

export const arraysEqual = <T extends object>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  function objectsEqual(obj1: T, obj2: T): boolean {
    const keys1 = Object.keys(obj1);

    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(obj2, key) &&
        obj1[key as keyof T] === obj2[key as keyof T]
    );
  }

  return arr1.every((item1) => arr2.some((item2) => objectsEqual(item1, item2)));
};

export const checkRPC = async (
  rpcUrl: string,
  network: number,
  address: string
): Promise<{
  isGoodRpc: boolean;
  isGoodArchiveRpc: boolean;
}> => {
  let isGoodRpc = false;
  let isGoodArchiveRpc = false;
  let currentBlockNumber = 0;
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);

    const blockNumber = await provider.getBlockNumber();

    if (blockNumber) {
      currentBlockNumber = blockNumber;
      isGoodRpc = true;
    }
  } catch (e) {
    console.log('erroe--', e);
    isGoodRpc = false;
    isGoodArchiveRpc = false;
  }
  if (currentBlockNumber) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);

      const estimatedBlocks = Math.floor(604800 / averageBlockTime[network]);

      const nearestBlock = await provider.getBlock(currentBlockNumber - estimatedBlocks);

      const rewardsContractAddress = REWARDS_ADDRESSES[network];

      const rewardsContract = new ethers.Contract(rewardsContractAddress, RewardsABI, provider);

      const rewardsTransactionsFiltered = await rewardsContract.queryFilter(
        rewardsContract.filters.RewardClaimed(address, null),
        currentBlockNumber - estimatedBlocks,
        Number(currentBlockNumber)
      );

      if (nearestBlock && rewardsTransactionsFiltered) {
        isGoodArchiveRpc = true;
      }
    } catch (e) {
      console.log('error--', e);
      isGoodArchiveRpc = false;
    }
  }

  return {
    isGoodRpc,
    isGoodArchiveRpc,
  };
};

export function removeDuplicatesByHash(array: TransactionData[]) {
  const seenHashes = new Set();
  return array.filter((item) => {
    if (seenHashes.has(item.hash)) {
      return false;
    }
    seenHashes.add(item.hash);
    return true;
  });
}

export const delayFunc = (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms));
