import { useMemo } from 'react';
import { ethers } from 'ethers';
import { Address, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { getBlock, getBlockNumber } from '@wagmi/core';

import { oneDay } from '@/shared/consts/constant';
import { getEthersProvider } from '@/shared/lib/utils';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { averageBlockTime } from '@/shared/web3/hook/getUserTransactions';
import { getArchiveRpcConfig, getRPCConfig } from '@/shared/web3/rpcConfigs';
import useBaseAssetChartStore, { ChartDataType } from '@/store/base-asset-chart';
import { useDashboardStore } from '@/store/dashboard';
import { useRPCStore } from '@/store/rpc';

const dayInSeconds = 86400;

export const STEPS: { [key: number]: number } = {
  7: 4,
  30: 10,
};

const getBaseAssetChartData = () => {
  const { address } = useAccount();

  const { filter } = useDashboardStore();

  const { chartData, setChartData } = useBaseAssetChartStore();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const activeFilter = useMemo(() => filter.find(({ active }) => active)?.value || 7, [filter]);

  const rightRPC = getRPCConfig(
    address,
    publicRPC,
    myWalletRPC,
    customRPC,
    lastChange,
    customRPCList
  );

  const archiveConfig = getArchiveRpcConfig(customRPC, lastChange, customRPCList);

  const getAssetBalance = async (
    currentBaseTokenUserBalance: bigint,
    cometAddress: Address,
    baseTokenAddress: Address,
    baseTokenPrice: number,
    decimals: number,
    networkId: number
  ) => {
    if (!address || !networkId || !baseTokenAddress) {
      return [];
    }
    const findCurrentUser = chartData[address];

    const currentMarket = findCurrentUser ? findCurrentUser[baseTokenAddress] : null;
    if (
      currentMarket &&
      new Date().getTime() - currentMarket[0].getDataTimeStamp < oneDay &&
      currentMarket.length >= STEPS[activeFilter]
    ) {
      const replacedLastBalance = [...currentMarket];

      replacedLastBalance.splice(currentMarket.length - 1, 1, {
        ...currentMarket[currentMarket.length - 1],
        balance: Number(formatUnits(currentBaseTokenUserBalance, decimals)) * baseTokenPrice,
        balanceSecond: Number(formatUnits(currentBaseTokenUserBalance, decimals)) * baseTokenPrice,
        balanceToken: currentBaseTokenUserBalance,
      });

      setChartData({
        ...chartData,
        [address]: {
          ...findCurrentUser,
          [baseTokenAddress]: replacedLastBalance,
        },
      });
      console.log(
        'we all ready have data about this chart today',
        new Date(currentMarket[0].getDataTimeStamp)
      );
      return;
    }

    const currentBlock = await getBlockNumber(rightRPC, {
      chainId: networkId,
    });

    const provider = getEthersProvider(archiveConfig, { chainId: networkId });

    const estimatedBlocks = Math.floor((dayInSeconds * activeFilter) / averageBlockTime[networkId]);

    const estimatedBlock = Number(currentBlock) - estimatedBlocks;

    const step = (Number(currentBlock) - estimatedBlock) / (STEPS[activeFilter] - 1);

    const blockToCheckBalance = Array.from(
      { length: STEPS[activeFilter] },
      (_, i) => estimatedBlock + i * step
    );

    const chartDataResult: PromiseSettledResult<ChartDataType>[] = await Promise.allSettled(
      blockToCheckBalance.map(async (block, index): Promise<ChartDataType> => {
        const isLastBlock = blockToCheckBalance.length - 1 === index;

        const tokenContract = new ethers.Contract(cometAddress, CometABI, provider);

        const blockNumber = await getBlock(rightRPC, {
          blockNumber: isLastBlock ? currentBlock : BigInt(block),
          chainId: networkId,
        });

        try {
          const balance = await tokenContract.balanceOf(address, {
            blockTag: block,
          });

          return {
            balance: Number(formatUnits(balance, decimals)) * baseTokenPrice,
            balanceSecond: Number(formatUnits(balance, decimals)) * baseTokenPrice,
            balanceToken: balance ? balance.toBigInt() : BigInt(0),
            timestamp: Number(blockNumber.timestamp),
            networkId: networkId,
            address: address,
            getDataTimeStamp: new Date().getTime(),
          };
        } catch (e) {
          return {
            balance: 0,
            balanceSecond: 0,
            balanceToken: BigInt(0),
            timestamp: Number(blockNumber.timestamp),
            networkId: networkId,
            address: address,
            getDataTimeStamp: new Date().getTime(),
          };
        }
      })
    );

    const result = chartDataResult
      .filter(({ status }) => status === 'fulfilled')
      .map((data) =>
        data.status !== 'rejected'
          ? data?.value
          : {
              balance: 0,
              balanceSecond: 0,
              balanceToken: BigInt(0),
              timestamp: 0,
              networkId: networkId,
              address: address,
              getDataTimeStamp: new Date().getTime(),
            }
      );

    result.splice(result.length - 1, 1, {
      ...result[result.length - 1],
      balance: Number(formatUnits(currentBaseTokenUserBalance, decimals)) * baseTokenPrice,
      balanceSecond: Number(formatUnits(currentBaseTokenUserBalance, decimals)) * baseTokenPrice,
      balanceToken: currentBaseTokenUserBalance,
    });

    setChartData({
      ...chartData,
      [address]: {
        ...findCurrentUser,
        [baseTokenAddress]: result,
      },
    });

    return chartData;
  };

  return { getAssetBalance };
};

export default getBaseAssetChartData;
