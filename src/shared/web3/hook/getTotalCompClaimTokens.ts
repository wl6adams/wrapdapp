import { Address, formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { arbitrum, base, Chain, mainnet, mantle, optimism, polygon, scroll } from 'wagmi/chains';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { UsePublicClientReturnType } from 'wagmi/src/hooks/usePublicClient';

import { oneDay } from '@/shared/consts/constant';
import useCompEarnedStore from '@/store/comp-earned';

import { RewardsABI } from '../abi/RewardsABI';
import { MARKET_ADDRESSES, REWARDS_ADDRESSES } from '../config';
import { CompTotalData, ConfigTypes, StaticCallResponse } from '../types';

const simulateCreator = async (
  chain: Chain,
  marketAddresses: { [key: string]: ConfigTypes },
  rewardContactAddress: Address,
  PublicClient: UsePublicClientReturnType<any, any>,
  address: Address
) => {
  return Promise.all(
    Object.keys(marketAddresses).map(async (key) =>
      PublicClient.simulateContract({
        abi: RewardsABI,
        address: rewardContactAddress,
        functionName: 'getRewardOwed',
        args: address ? [marketAddresses[key].address, address] : undefined,
        chain,
        account: address,
      })
    )
  );
};

export const useMultiChainRewardOwed = () => {
  const { address } = useAccount();

  const {
    totalCompData,
    setTotalCompData,
    lastTimeStamp,
    seLastTimeStamp,
    setUserAddress,
    userAddress,
  } = useCompEarnedStore();

  const PublicClientMainnet = usePublicClient({ chainId: mainnet.id });
  const PublicClientPolygon = usePublicClient({ chainId: polygon.id });
  const PublicClientArbitrum = usePublicClient({ chainId: arbitrum.id });
  const PublicClientBaase = usePublicClient({ chainId: base.id });
  const PublicClientOptimism = usePublicClient({ chainId: optimism.id });
  const PublicClientScroll = usePublicClient({ chainId: scroll.id });
  const PublicClientMantle = usePublicClient({ chainId: mantle.id });

  const clients: UsePublicClientReturnType<any, any>[] = [
    PublicClientMainnet,
    PublicClientPolygon,
    PublicClientArbitrum,
    PublicClientBaase,
    PublicClientOptimism,
    PublicClientScroll,
    PublicClientMantle,
  ];

  const getMetrics = async (hardGet?: boolean): Promise<CompTotalData[] | undefined> => {
    if (
      lastTimeStamp &&
      new Date().getTime() - lastTimeStamp < oneDay &&
      totalCompData.length &&
      userAddress === address &&
      !hardGet
    ) {
      return totalCompData;
    }
    if (address) {
      const result = await Promise.allSettled(
        clients.map(async (publicClient) => {
          const marketAddresses = MARKET_ADDRESSES[publicClient.chain.id];
          const rewardContactAddress = REWARDS_ADDRESSES[publicClient.chain.id];

          return await simulateCreator(
            publicClient.chain,
            marketAddresses,
            rewardContactAddress,
            publicClient,
            address
          );
        })
      );

      const goodResponse = result
        .filter(({ status }) => status === 'fulfilled')
        .map((data: any) => data?.value);

      const resultResponse = goodResponse.flatMap((array: any) =>
        array.map((data: StaticCallResponse, index: number) => ({
          chainId: data.request.chain.id,
          result: Number(formatUnits(data.result.owed, 18)),
          resultAddress: data.result.token,
          index: index,
        }))
      );
      setUserAddress(address);
      setTotalCompData(resultResponse);
      seLastTimeStamp(new Date().getTime());
      return resultResponse;
    }
  };

  return { getMetrics };
};
