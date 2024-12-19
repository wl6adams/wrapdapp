import { Address, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { fetchBalance, multicall } from '@wagmi/core';

import { secondsPerYear } from '@/shared/consts/constant';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useStore } from '@/store';
import { useRPCStore } from '@/store/rpc';

import { CometABI } from '../abi/CometABI';
import { ConfiguratorABI } from '../abi/ConfiguratorABI';
import { ERC20ABI } from '../abi/ERC20';
import { TokenABI } from '../abi/TokenABI';
import { contractsConfig } from '../chainConfig';
import {
  COMP_MAIN_COMET_ADDRESS,
  COMP_MAIN_PRICE_FEE,
  CONFIGURATOR_ADDRESSES,
  ETH_MAIN_PRICE_FEE,
  MARKET_ADDRESSES,
  NetworksNames,
  wstETH_MAIN_PRICE_FEE,
} from '../config';
import { AllCollateralData, CollateralData, SupportedChainId, TableData } from '../types';
import { DEFAULT_CHAIN_ID } from '../wagmiConfig';

export const priceFeedMantissa = 8;

const getAllDataForTable = async (
  chainId: SupportedChainId,
  compPrice: bigint,
  ethPrice: bigint,
  wstEthPrice: bigint,
  config: any,
  address?: Address
): Promise<TableData[]> => {
  const baseDecimal = 18;

  const secondsPerDay = 60 * 60 * 24;
  const daysInYear = 365;

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
      {
        address: marketAddresses[key].address,
        abi: CometABI,
        functionName: 'balanceOf',
        args: [address],
      } as const,
      {
        address: marketAddresses[key].address,
        abi: CometABI,
        functionName: 'borrowBalanceOf',
        args: [address],
      } as const,
      {
        abi: ConfiguratorABI,
        address: CONFIGURATOR_ADDRESSES[chainId],
        functionName: 'getConfiguration',
        args: [marketAddresses[key].address],
      } as const,
      {
        address: marketAddresses[key].address,
        abi: CometABI,
        functionName: 'getReserves',
      } as const,
      {
        address: contractsConfig.token[chainId][key].addressFrom,
        abi: TokenABI,
        functionName: 'balanceOf',
        args: [marketAddresses[key].address],
      } as const,
      {
        address: marketAddresses[key].address,
        abi: CometABI,
        functionName: 'baseBorrowMin',
      } as const,
      {
        address: contractsConfig.token[chainId][key].addressFrom,
        abi: TokenABI,
        functionName: 'balanceOf',
        args: [address],
      } as const,
    ]),
  });

  const BASE_DATA_LENGTH = 9;

  const prepareAllMetrics = marketKeys.flatMap((key, index) => {
    const { address } = marketAddresses[key];

    const [baseTokenPriceFeed, utilization] = cometBaseData
      .slice(index * BASE_DATA_LENGTH, BASE_DATA_LENGTH * (index + 1))
      .map((res) => res.result);

    return [
      { address, abi: CometABI, functionName: 'baseToken' } as const,
      { address, abi: CometABI, functionName: 'decimals' } as const,
      { address, abi: CometABI, functionName: 'baseIndexScale' } as const,
      { address, abi: CometABI, functionName: 'totalSupply' } as const,
      { address, abi: CometABI, functionName: 'totalBorrow' } as const,
      { address, abi: CometABI, functionName: 'getPrice', args: [baseTokenPriceFeed] } as const,
      { address, abi: CometABI, functionName: 'baseTrackingSupplySpeed' } as const,
      { address, abi: CometABI, functionName: 'baseTrackingBorrowSpeed' } as const,
      { address, abi: CometABI, functionName: 'getSupplyRate', args: [utilization] } as const,
      { address, abi: CometABI, functionName: 'getBorrowRate', args: [utilization] } as const,
      { address, abi: CometABI, functionName: 'supplyKink' } as const,
      { address, abi: CometABI, functionName: 'supplyPerSecondInterestRateBase' } as const,
      { address, abi: CometABI, functionName: 'supplyPerSecondInterestRateSlopeLow' } as const,
      { address, abi: CometABI, functionName: 'supplyPerSecondInterestRateSlopeHigh' } as const,
      { address, abi: CometABI, functionName: 'borrowKink' } as const,
      { address, abi: CometABI, functionName: 'borrowPerSecondInterestRateBase' } as const,
      { address, abi: CometABI, functionName: 'borrowPerSecondInterestRateSlopeLow' } as const,
      { address, abi: CometABI, functionName: 'borrowPerSecondInterestRateSlopeHigh' } as const,
    ];
  });

  const METRICS_LENGTH = 18;

  const tokensData = await multicall(config, { chainId, contracts: prepareAllMetrics });

  let nativeBalance = BigInt(0);
  if (address) {
    const nativeBalanceResult = await fetchBalance(config, {
      address,
      chainId,
    });

    if (nativeBalanceResult?.value) {
      nativeBalance = nativeBalanceResult.value;
    }
  }

  return marketKeys.map((tokenSymbol, index) => {
    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _,
      utilization,
      supplyBalanceResult,
      borrowBalanceResult,
      configuratorData,
      totalReserves,
      availableLiquidityResult,
      minBorrowResult,
      baseTokenUserBalanceResult,
    ] = cometBaseData
      .slice(index * BASE_DATA_LENGTH, BASE_DATA_LENGTH * (index + 1))
      .map((res) => res.result);

    const [
      baseTokenAddress,
      decimalsResult,
      baseIndexScaleResult,
      totalSupplyResult,
      totalBorrowResult,
      baseTokenPriceFeed,
      baseTrackingSupplySpeedResult,
      baseTrackingBorrowSpeedResult,
      supplyRateResult,
      getBorrowRateResult,
      supplyKinkResult,
      supplyPerSecondInterestRateBaseResult,
      supplyPerSecondInterestRateSlopeLowResult,
      supplyPerSecondInterestRateSlopeHighResult,
      borrowKinkResult,
      borrowPerSecondInterestRateBaseResult,
      borrowPerSecondInterestRateSlopeLowResult,
      borrowPerSecondInterestRateSlopeHighResult,
    ] = tokensData
      .slice(index * METRICS_LENGTH, METRICS_LENGTH * (index + 1))
      .map((res) => res.result);

    const isWeth = tokenSymbol === 'ETH';
    const iswstEth = tokenSymbol === 'wstETH';

    const address = MARKET_ADDRESSES[chainId][tokenSymbol].address;

    const baseIndexScale = Number(baseIndexScaleResult);

    const compPriceInUsd = Number(formatUnits(compPrice, priceFeedMantissa));

    const bigbaseTokenPriceFeed = BigInt(baseTokenPriceFeed || 0);

    const usdcPriceInUsd = Number(
      formatUnits(
        isWeth ? ethPrice : iswstEth ? wstEthPrice : bigbaseTokenPriceFeed,
        priceFeedMantissa
      )
    );

    const baseTotalSupply = Number(
      formatUnits(BigInt(totalSupplyResult || 0), Number(decimalsResult))
    );
    const baseTotalBorrow = Number(
      formatUnits(BigInt(totalBorrowResult || 0), Number(decimalsResult))
    );

    const baseTrackingSupplySpeed = Number(baseTrackingSupplySpeedResult || BigInt(0));
    const baseTrackingBorrowSpeed = Number(baseTrackingBorrowSpeedResult || BigInt(0));

    const compToSuppliersPerDay = (baseTrackingSupplySpeed / baseIndexScale) * secondsPerDay;
    const compToBorrowersPerDay = (baseTrackingBorrowSpeed / baseIndexScale) * secondsPerDay;

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

    const utility = Number(utilization || BigInt(0)) / 1e16;

    const supplyBalance: number = Number(supplyBalanceResult || 0);
    const borrowBalance: number = Number(borrowBalanceResult || 0);
    const resultTotalReserves: number = Number(totalReserves || 0);
    const resultAvailableLiquidity: number = Number(availableLiquidityResult || 0);
    const minBorrow: number = Number(minBorrowResult || 0);

    const baseTokenUserBalance: number =
      isWeth && Number(baseTokenUserBalanceResult || 0) <= 0
        ? Number(nativeBalance)
        : Number(baseTokenUserBalanceResult || 0);

    const supplyKink: bigint = supplyKinkResult as bigint;

    const supplyPerSecondInterestRateBase: bigint = supplyPerSecondInterestRateBaseResult as bigint;

    const supplyPerSecondInterestRateSlopeLow: bigint =
      supplyPerSecondInterestRateSlopeLowResult as bigint;

    const supplyPerSecondInterestRateSlopeHigh: bigint =
      supplyPerSecondInterestRateSlopeHighResult as bigint;

    const borrowKink: bigint = borrowKinkResult as bigint;

    const borrowPerSecondInterestRateBase: bigint = borrowPerSecondInterestRateBaseResult as bigint;

    const borrowPerSecondInterestRateSlopeLow: bigint =
      borrowPerSecondInterestRateSlopeLowResult as bigint;

    const borrowPerSecondInterestRateSlopeHigh: bigint =
      borrowPerSecondInterestRateSlopeHighResult as bigint;

    return {
      chainId,
      asset: tokenSymbol,
      minBorrow: Number(formatUnits(BigInt(minBorrow), Number(decimalsResult || baseDecimal))),
      supplyBalance: BigInt(supplyBalance),
      borrowBalance: BigInt(borrowBalance),
      baseTokenAddress: baseTokenAddress as `0x${string}`,
      cometAddress: address,
      decimals: BigInt(decimalsResult || 18),
      netEarnAPY: isNaN(supplyApr + supplyCompRewardApr) ? 0 : supplyApr + supplyCompRewardApr,
      supplyApr: supplyApr,
      supplyCompRewardApr: supplyCompRewardApr,
      price: usdcPriceInUsd,
      baseTotalSupply: baseTotalSupply,
      totalEarning: usdcPriceInUsd * baseTotalSupply,
      netBorrowAPY: isNaN(borrowApr - borrowCompRewardApr) ? 0 : borrowApr - borrowCompRewardApr,
      borrowApr: borrowApr,
      borrowCompRewardApr: borrowCompRewardApr,
      totalBorrowed: isWeth
        ? (baseTotalBorrow * Number(ethPrice)) / 1e8
        : iswstEth
          ? (baseTotalBorrow * Number(wstEthPrice)) / 1e8
          : baseTotalBorrow,
      utility: utility,
      baseTokenUserBalance: baseTokenUserBalance,
      totalReserves: BigInt(resultTotalReserves),
      availableLiquidity: BigInt(resultAvailableLiquidity),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      configuratorData: configuratorData?.assetConfigs as AllCollateralData[],
      curveMetrics: {
        supplyKink,
        supplyPerSecondInterestRateBase,
        supplyPerSecondInterestRateSlopeLow,
        supplyPerSecondInterestRateSlopeHigh,
        borrowKink,
        borrowPerSecondInterestRateBase,
        borrowPerSecondInterestRateSlopeLow,
        borrowPerSecondInterestRateSlopeHigh,
      },
    };
  });
};

export const getPrices = async (config: any) => {
  const result = await multicall(config, {
    chainId: mainnet.id,
    contracts: [
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: 'getPrice',
        args: [COMP_MAIN_PRICE_FEE],
      } as const,
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: 'getPrice',
        args: [ETH_MAIN_PRICE_FEE],
      } as const,
      {
        address: COMP_MAIN_COMET_ADDRESS,
        abi: TokenABI,
        functionName: 'getPrice',
        args: [wstETH_MAIN_PRICE_FEE],
      } as const,
    ],
  });
  return result;
};

const GetMarketData = () => {
  const { chainId, address } = useAccount();

  const { setIsAddressData, setAllMarketsData, setCompoundPrice } = useStore();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const rightRPC = getRPCConfig(
    address,
    publicRPC,
    myWalletRPC,
    customRPC,
    lastChange,
    customRPCList
  );

  const getTableData = async () => {
    const [compPrice, ethPrice, wstEthPrice] = await getPrices(rightRPC);

    if (!compPrice?.result || !ethPrice?.result || !wstEthPrice.result) return;

    setCompoundPrice(Number(formatUnits(compPrice.result, priceFeedMantissa)));

    const tableData = await Promise.all(
      Object.keys(NetworksNames).map((networkId) =>
        getAllDataForTable(
          Number(networkId),
          compPrice.result,
          ethPrice.result,
          wstEthPrice.result,
          rightRPC,
          address
        )
      )
    );

    const flatTableData = tableData.flat();

    const allColatteralTabeData = await Promise.all(
      tableData.flatMap((chainData) =>
        chainData.map(
          async (market) =>
            await getTokensData(market.configuratorData, market.cometAddress, market.chainId)
        )
      )
    );

    const allMarketsData = flatTableData.map((data, index) => ({
      ...data,
      configuratorData: allColatteralTabeData[index],
    }));

    setAllMarketsData(allMarketsData);

    setIsAddressData(!!address);

    return allMarketsData;
  };

  const getTokensData = async (
    data: readonly CollateralData[] | undefined,
    cometAddress: Address,
    networkId: SupportedChainId = chainId || DEFAULT_CHAIN_ID
  ): Promise<AllCollateralData[]> => {
    if (!data) {
      return [];
    }

    const countTokenFunctions = 7;

    const tokensResponse = await multicall(rightRPC, {
      chainId: networkId,
      contracts: data?.flatMap(({ asset, priceFeed }) => [
        {
          address: cometAddress,
          abi: CometABI,
          functionName: 'totalsCollateral',
          args: [asset],
        } as const,
        {
          address: asset,
          abi: ERC20ABI,
          functionName: 'symbol',
        } as const,
        {
          address: asset,
          abi: ERC20ABI,
          functionName: 'balanceOf',
          args: [address],
        } as const,
        {
          address: asset,
          abi: ERC20ABI,
          functionName: 'allowance',
          args: [address, cometAddress],
        } as const,
        {
          address: cometAddress,
          abi: CometABI,
          functionName: 'getPrice',
          args: [priceFeed],
        } as const,
        {
          address: cometAddress,
          abi: CometABI,
          functionName: 'userCollateral',
          args: [address, asset],
        } as const,
        {
          address: cometAddress,
          abi: CometABI,
          functionName: 'getCollateralReserves',
          args: [asset],
        } as const,
      ]),
    });

    return data.map((colData, index) => {
      const [
        resultTotalSupplyToken,
        symbol,
        balanceOf,
        allowance,
        collateralPrice,
        totalSupplyResult,
        ReservesResult,
      ] = tokensResponse
        .slice(index * countTokenFunctions, countTokenFunctions * (index + 1))
        .map((res) => res.result);

      const totalSupply = totalSupplyResult as [bigint, bigint];
      const totalSupplyToken = resultTotalSupplyToken as [bigint, bigint];
      const Reserves = ReservesResult as bigint;

      return {
        ...colData,
        symbol: symbol?.toString() || '',
        balanceOf: BigInt((balanceOf as string) || 0),
        allowance: BigInt((allowance as string) || 0),
        price: BigInt((collateralPrice as string) || 0),
        totalSupply: totalSupply?.[0] || BigInt(0),
        totalSupplyToken:
          totalSupplyToken?.length && totalSupplyToken[0]
            ? Number(formatUnits(totalSupplyToken[0], colData.decimals))
            : 0,
        reserves: Reserves,
      };
    });
  };

  return { getTableData, getTokensData };
};

export default GetMarketData;
