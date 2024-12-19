import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { multicall } from '@wagmi/core';

import { secondsPerYear } from '@/shared/consts/constant';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useRPCStore } from '@/store/rpc';

import { CometABI } from '../abi/CometABI';
import { MARKET_ADDRESSES, NetworksNames } from '../config';
import { HomePageDataType, SupportedChainId } from '../types';

import { getPrices, priceFeedMantissa } from './getMarketData';

const baseDecimal = 18;

const secondsPerDay = 60 * 60 * 24;

const daysInYear = 365;

const HomePageData = () => {
  const { address } = useAccount();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const getData = async (
    chainId: SupportedChainId,
    compPrice: bigint,
    ethPrice: bigint,
    wstEthPrice: bigint,
    config: any
  ): Promise<HomePageDataType[]> => {
    const marketAddresses = MARKET_ADDRESSES[chainId];
    const marketKeys = Object.keys(marketAddresses);

    const cometBaseData = await multicall(config, {
      chainId,
      contracts: marketKeys.flatMap((key) => [
        {
          address: marketAddresses[key].address,
          abi: CometABI,
          functionName: 'baseTokenPriceFeed',
        } as const,
        {
          address: marketAddresses[key].address,
          abi: CometABI,
          functionName: 'getUtilization',
        } as const,
      ]),
    });

    const BASE_DATA_LENGTH = 2;

    const prepareAllMetrics = marketKeys.flatMap((key, index) => {
      const { address } = marketAddresses[key];

      const [baseTokenPriceFeed, utilization] = cometBaseData
        .slice(index * BASE_DATA_LENGTH, BASE_DATA_LENGTH * (index + 1))
        .map((res) => res.result);

      return [
        { address, abi: CometABI, functionName: 'decimals' } as const,
        { address, abi: CometABI, functionName: 'totalSupply' } as const,
        { address, abi: CometABI, functionName: 'totalBorrow' } as const,
        { address, abi: CometABI, functionName: 'baseIndexScale' } as const,
        { address, abi: CometABI, functionName: 'getPrice', args: [baseTokenPriceFeed] } as const,
        { address, abi: CometABI, functionName: 'baseTrackingSupplySpeed' } as const,
        { address, abi: CometABI, functionName: 'baseTrackingBorrowSpeed' } as const,
        { address, abi: CometABI, functionName: 'getSupplyRate', args: [utilization] } as const,
        { address, abi: CometABI, functionName: 'getBorrowRate', args: [utilization] } as const,
      ];
    });
    const tokensData = await multicall(config, { chainId, contracts: prepareAllMetrics });

    const METRICS_LENGTH = 9;

    return marketKeys.map((tokenSymbol, index) => {
      const [
        decimalsResult,
        totalSupplyResult,
        totalBorrowResult,
        baseIndexScaleResult,
        baseTokenPriceFeed,
        baseTrackingSupplySpeedResult,
        baseTrackingBorrowSpeedResult,
        supplyRateResult,
        getBorrowRateResult,
      ] = tokensData
        .slice(index * METRICS_LENGTH, METRICS_LENGTH * (index + 1))
        .map((res) => res.result);

      const isWeth = tokenSymbol === 'ETH';
      const isWstEth = tokenSymbol === 'wstETH';

      const baseIndexScale = Number(baseIndexScaleResult);

      const baseTrackingSupplySpeed = Number(baseTrackingSupplySpeedResult || BigInt(0));
      const baseTrackingBorrowSpeed = Number(baseTrackingBorrowSpeedResult || BigInt(0));

      const compToSuppliersPerDay = (baseTrackingSupplySpeed / baseIndexScale) * secondsPerDay;
      const compToBorrowersPerDay = (baseTrackingBorrowSpeed / baseIndexScale) * secondsPerDay;

      const baseTotalSupply = Number(
        formatUnits(BigInt(totalSupplyResult || 0), Number(decimalsResult))
      );

      const baseTotalBorrow = Number(
        formatUnits(BigInt(totalBorrowResult || 0), Number(decimalsResult))
      );

      const bigbaseTokenPriceFeed = BigInt(baseTokenPriceFeed || 0);

      const ETHprice = BigInt(ethPrice || 0);

      const usdcPriceInUsd = Number(
        formatUnits(
          isWeth ? ETHprice : isWstEth ? wstEthPrice : bigbaseTokenPriceFeed,
          priceFeedMantissa
        )
      );

      const compPriceInUsd = Number(formatUnits(compPrice, priceFeedMantissa));

      const totalEarning = isWeth ? (baseTotalSupply * Number(ethPrice)) / 1e8 : baseTotalSupply;
      const totalBorrowed = isWeth ? (baseTotalBorrow * Number(ethPrice)) / 1e8 : baseTotalBorrow;

      const supplyApr =
        Number(formatUnits(BigInt(supplyRateResult || 0), baseDecimal)) * secondsPerYear * 100;

      const borrowApr =
        Number(formatUnits(BigInt(getBorrowRateResult || 0), baseDecimal)) * secondsPerYear * 100;

      const supplyCompRewardApr =
        ((compPriceInUsd * compToSuppliersPerDay) / (baseTotalSupply * usdcPriceInUsd)) *
        daysInYear *
        100;

      const borrowCompRewardApr =
        ((compPriceInUsd * compToBorrowersPerDay) / (baseTotalBorrow * usdcPriceInUsd)) *
        daysInYear *
        100;

      return {
        chainId,
        asset: tokenSymbol,
        decimals: Number(decimalsResult || 0),
        totalEarning,
        totalBorrowed,
        totalAll: totalEarning + totalBorrowed,
        price: usdcPriceInUsd,
        netBorrowAPY: borrowApr - borrowCompRewardApr,
        netEarnAPY: supplyApr + supplyCompRewardApr,
      };
    });
  };

  const getHomePageData = async () => {
    const rightRPC = getRPCConfig(
      address,
      publicRPC,
      myWalletRPC,
      customRPC,
      lastChange,
      customRPCList
    );

    const [compPrice, ethPrice, wstEthPrice] = await getPrices(rightRPC);

    if (!compPrice?.result || !ethPrice?.result || !wstEthPrice.result) {
      return;
    }

    const marketsData = await Promise.all(
      Object.keys(NetworksNames).map((networkId) =>
        getData(Number(networkId), compPrice.result, ethPrice.result, wstEthPrice.result, rightRPC)
      )
    );

    return marketsData.flat();
  };

  return {
    getHomePageData,
  };
};

export default HomePageData;
