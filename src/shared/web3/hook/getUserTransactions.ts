import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll } from 'wagmi/chains';
import { useToast } from '@chakra-ui/react';
import { getBlockNumber } from '@wagmi/core';

import { delayFunc, getEthersProvider, removeDuplicatesByHash } from '@/shared/lib/utils';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { RewardsABI } from '@/shared/web3/abi/RewardsABI';
import { MARKET_ADDRESSES, NetworksNames, REWARDS_ADDRESSES } from '@/shared/web3/config';
import { getArchiveRpcConfig, getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useRPCStore } from '@/store/rpc';
import { useTransactions } from '@/store/transaction';

const totalSeconds = 2592000; //30 days
// const totalSeconds = 604800; //7 days

export const averageBlockTime: { [key: number]: number } = {
  [mainnet.id]: 12,
  [polygon.id]: 2.1,
  [arbitrum.id]: 0.3,
  [base.id]: 2,
  [optimism.id]: 2,
  [scroll.id]: 14,
  [mantle.id]: 1,
};

export const viewOperationName: { [key: string]: string } = {
  Supply: 'Lend',
  TransferFrom: 'Lend',
  TransferTo: 'Withdraw',
  SupplyCollateral: 'Supply Collateral',
  WithdrawCollateral: 'Withdraw Collateral',
  RewardClaimed: 'Claim Rewards',
};

const getTableDataForTransaction = async (
  event: ethers.Event,
  marketSymbol: string,
  networkId: number,
  address: string,
  provider: ethers.providers.FallbackProvider | ethers.providers.JsonRpcProvider
) => {
  if (!event?.args || !event?.event) {
    return {
      market: marketSymbol,
      network: networkId,
      date: 0,
      event: '',
      collateral: '',
      from: '0',
      to: '0',
      value: BigInt(0),
      hash: '',
    };
  }
  const { from, to, amount, asset } = event.args;

  const block = await provider.getBlock(event.blockNumber);

  return {
    collateral: asset || '',
    market: marketSymbol,
    network: networkId,
    date: block.timestamp,
    event:
      viewOperationName[
        event.event === 'Transfer'
          ? from !== address
            ? 'TransferFrom'
            : 'TransferTo'
          : event.event
      ] || '',
    from,
    to,
    value: amount,
    hash: event.transactionHash,
  };
};

const getUserTransactions = () => {
  const { address } = useAccount();

  const { setTransaction, setIsLoadingEnd } = useTransactions();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const toast = useToast();

  const rightRPC = getRPCConfig(
    address,
    publicRPC,
    myWalletRPC,
    customRPC,
    lastChange,
    customRPCList
  );

  const archiveConfig = getArchiveRpcConfig(customRPC, lastChange, customRPCList);

  const userChainTransactions = async (networkId: number) => {
    const provider = getEthersProvider(archiveConfig, { chainId: networkId });

    if (!provider || !address) {
      console.error('provider error');
      return;
    }

    const currentBlock = await getBlockNumber(rightRPC, {
      chainId: networkId,
    });

    const estimatedBlocks = Math.floor(totalSeconds / averageBlockTime[networkId]);

    let estimatedBlock = Number(currentBlock) - estimatedBlocks;

    const rewardsContractAddress = REWARDS_ADDRESSES[networkId];

    const rewardsContract = new ethers.Contract(rewardsContractAddress, RewardsABI, provider);

    const rewardsTransactionsFiltered = await rewardsContract
      .queryFilter(
        rewardsContract.filters.RewardClaimed(address, null),
        estimatedBlock,
        Number(currentBlock)
      )
      .catch((error: any) => {
        if (error.code === 429) {
          toast({
            title: 'RPC is busy',
            description: 'Rate limit exceeded: 429 Too Many Requests',
            status: 'error',
            duration: 10000,
            isClosable: true,
          });
        } else {
          console.error(error);
        }
        return [];
      });

    const rewardsTransactions = await Promise.all(
      rewardsTransactionsFiltered?.map(async (event, index) => {
        await delayFunc(index * 1000);
        return getTableDataForTransaction(event, 'COMP', networkId, address, provider);
      })
    );

    if (rewardsTransactions.length) {
      setTransaction({ [rewardsContractAddress as string]: rewardsTransactions });
    }

    const getNetworkMarkets = MARKET_ADDRESSES[networkId];

    try {
      return await Promise.all(
        Object.entries(getNetworkMarkets).map(async ([marketSymbol, market]) => {
          const contract = new ethers.Contract(
            getNetworkMarkets[marketSymbol].address,
            CometABI,
            provider
          );

          const queries = [
            contract.filters.Transfer(address, null),
            contract.filters.Transfer(null, address),
            contract.filters.Supply(null, address),
            contract.filters.SupplyCollateral(null, address),
            contract.filters.WithdrawCollateral(address, null),
          ];

          try {
            const allFilteredTransactions = await Promise.all(
              queries.map(async (data, index) => {
                await delayFunc(index * 1000);
                return contract.queryFilter(data, estimatedBlock, Number(currentBlock));
              })
            );
            const result = await Promise.all(
              allFilteredTransactions
                .flat()
                .map(async (event) =>
                  getTableDataForTransaction(event, marketSymbol, networkId, address, provider)
                )
            );

            if (result.length) {
              const uniqueTransactions = removeDuplicatesByHash(result);

              setTransaction({ [market.address]: uniqueTransactions });
            }

            return { [market.address]: result };
          } catch (e) {
            console.log('fail to call--', e);
            estimatedBlock =
              Number(currentBlock) - Math.floor(604800 / averageBlockTime[networkId]);

            const allFilteredTransactions = await Promise.all(
              queries.map(async (data, index) => {
                await delayFunc(index * 1000);
                return contract.queryFilter(data, estimatedBlock, Number(currentBlock));
              })
            );

            const result = await Promise.all(
              allFilteredTransactions
                .flat()
                .map(async (event) =>
                  getTableDataForTransaction(event, marketSymbol, networkId, address, provider)
                )
            );

            if (result.length) {
              const uniqueTransactions = removeDuplicatesByHash(result);

              setTransaction({ [market.address]: uniqueTransactions });
            }

            return { [market.address]: result };
          }
        })
      );
    } catch (error: any) {
      if (error.code === 429) {
        toast({
          title: 'RPC is busy',
          description: 'Rate limit exceeded: 429 Too Many Requests',
          status: 'error',
          duration: 10000,
          isClosable: true,
        });
      } else {
        console.error(error);
      }
    }
  };

  const getTransactions = async () => {
    if (!address) {
      return null;
    }

    const transactionsResponse = await Promise.all(
      Object.keys(NetworksNames).map((networkId) => userChainTransactions(Number(networkId)))
    );

    setIsLoadingEnd(true);
    return transactionsResponse.flat();
  };

  return { getTransactions };
};

export default getUserTransactions;
