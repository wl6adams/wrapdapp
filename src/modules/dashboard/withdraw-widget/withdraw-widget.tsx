import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useEstimateGas, useGasPrice, useReadContract, useSwitchChain } from 'wagmi';
import { Box, Button, Flex, FormLabel, Grid, Input, Switch, Text } from '@chakra-ui/react';

import { TransactionSuccessfully } from '@/modules/transaction-successfully/transaction-successfully';
import Loader from '@/modules/widget/loader/loader';
import { GasIcon } from '@/shared/chakra-ui/icons';
import { ACTION_WITHDRAW_NATIVE_TOKEN } from '@/shared/consts/constant';
import {
  formatSliceNumber,
  formatSliceTokenOrUSD,
  getBigNumber,
  isValidNumericInput,
  removeCommas,
  trimToDecimals,
} from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { View } from '@/shared/ui/view';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { contractsConfig, CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { BULKER_ADDRESS } from '@/shared/web3/config';
import { useApproveToken, useWithdraw } from '@/shared/web3/hook';
import { TableData } from '@/shared/web3/types';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useDashboardStore } from '@/store/dashboard';

interface WithdrawWidgetProps {
  marketData: TableData;
}

const WithdrawWidget = ({ marketData }: WithdrawWidgetProps) => {
  const { setReloadData } = useDashboardStore();

  const { switchChain } = useSwitchChain();

  const { isConnected, chainId, address } = useAccount();

  const { data: gasPrice } = useGasPrice();

  const { withdraw, isAbsoluteLoadingBorrowTokens, txHash } = useWithdraw();

  const { approveToken, isAbsoluteLoadingApprove } = useApproveToken();

  const { data: estimateGas } = useEstimateGas({
    to: BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][marketData.asset],
    value: getBigNumber('0', 18),
  });

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [value, setValue] = useState<string>('');

  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

  const [isMax, setIsMax] = useState(false);

  const networkCost = useMemo(() => {
    if (estimateGas && gasPrice) {
      return estimateGas * gasPrice;
    }

    return BigInt(0);
  }, [gasPrice, estimateGas]);

  const currentBalance = useMemo(
    () => formatUnits(marketData.supplyBalance, Number(marketData.decimals)),
    [marketData.supplyBalance, marketData.decimals]
  );

  const isBalance = !!marketData.supplyBalance ? Number(currentBalance) > 0 : false;

  const isWETH = marketData.asset === 'ETH';

  const isNotEnough = useMemo(
    () => Number(value) > Number(currentBalance || 0) || Number(currentBalance) === 0,
    [value, currentBalance]
  );

  const supplyBalance = useMemo(() => {
    const balance = formatUnits(marketData.supplyBalance, Number(marketData.decimals));

    return balance;
  }, [marketData.supplyBalance, marketData.decimals]);

  const { data: isAllowed, refetch: refetchIsAllowed } = useReadContract({
    abi: CometABI,
    address: marketData?.cometAddress,
    functionName: 'isAllowed',
    args:
      address && marketData
        ? [address, BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][marketData?.asset]]
        : undefined,
    blockTag: 'latest',
  });

  const withDrawToken = () => {
    withdraw(
      {
        abi: CometABI,
        address: marketData.cometAddress,
        functionName: 'withdraw',
        args: [
          marketData.baseTokenAddress,
          isMax ? marketData.supplyBalance : getBigNumber(value, Number(marketData.decimals)),
        ],
      },
      {
        onSuccess: () => {
          setIsSuccessful(true);
        },
        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);
        },
      }
    );
  };

  const withDrawInNativeToken = () => {
    const bulkerAddress =
      contractsConfig.token[chainId || DEFAULT_CHAIN_ID][marketData.asset].bulker;

    const data = [
      marketData.cometAddress,
      address,
      isMax ? marketData.supplyBalance : getBigNumber(value, Number(marketData.decimals)),
    ];

    const supplyWETH = [
      ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint'], data) as `0x${string}`,
    ];

    withdraw(
      {
        abi: BulkerABI,
        address: bulkerAddress,
        functionName: 'invoke',
        args: [[ACTION_WITHDRAW_NATIVE_TOKEN], supplyWETH],
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setIsSuccessful(true);
          }, 2000);
        },
        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);
        },
      }
    );
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === '' || isValidNumericInput(removeCommas(rawValue))) {
      const cleanedValue = trimToDecimals(rawValue, 18);

      setValue(cleanedValue);

      setIsMax(false);
    }
  };

  const onBlur = useCallback(() => {
    if (value) {
      const cleanedValue = trimToDecimals(value, 18);

      setValue(cleanedValue);
    }
  }, [value]);

  const onMax = () => {
    if (marketData.supplyBalance) {
      setValue(currentBalance);
      setIsMax(true);
    }
  };

  const onApproveToken = () => {
    approveToken(
      {
        abi: CometABI,
        address: marketData?.cometAddress || '0x',
        functionName: 'allow',
        args: [BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][marketData?.asset || ''], true],
      },
      {
        onSuccess: () => {
          refetchIsAllowed();
        },
        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);
        },
      }
    );
  };

  const onClickButton = () => {
    if (!isAllowed) {
      onApproveToken();
      return;
    }
    if (isWETH && !isChecked) {
      withDrawInNativeToken();
    } else {
      withDrawToken();
    }
  };

  useEffect(() => {
    if (chainId && isConnected && marketData?.chainId && chainId !== marketData.chainId) {
      switchChain({ chainId: marketData.chainId });
    }
  }, [chainId, isConnected, marketData, switchChain]);

  useEffect(() => {
    if (!isAbsoluteLoadingBorrowTokens && isSuccessful) {
      setTimeout(() => {
        setReloadData(true);
      }, 1000);
    }
  }, [isAbsoluteLoadingBorrowTokens, isSuccessful]);

  return (
    <Grid gridTemplateColumns='1fr'>
      <Flex
        borderBottom='1px solid'
        borderColor='brand.400'
        p='16px 24px'
      >
        <Text size='small16500140'>Withdraw</Text>
      </Flex>

      <Grid
        gridTemplateColumns='1fr'
        p='16px 24px'
        gap='8px'
      >
        <View.Condition if={!isAbsoluteLoadingBorrowTokens && !isSuccessful}>
          {isWETH && (
            <Flex alignItems='center'>
              <FormLabel
                htmlFor='userPosition'
                m='0 10px 0 0'
                whiteSpace='nowrap'
              >
                Withdraw with WETH
              </FormLabel>

              <Switch
                id='userPosition'
                isChecked={isChecked}
                isDisabled={isAbsoluteLoadingBorrowTokens}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
            </Flex>
          )}

          <Flex
            p='16px'
            gap='8px'
            borderRadius='8px'
            border='1px solid'
            flexDirection='column'
            alignItems='flex-start'
            opacity={!isBalance ? 0.5 : 1}
            borderColor={isNotEnough ? 'brand.1275' : 'transparent'}
            bg={isNotEnough ? 'brand.1125' : 'brand.whiteAlpha.200'}
            _hover={{ borderColor: 'brand.50' }}
          >
            <Text
              bottom='15px'
              color='brand.550'
              size='small14500120'
            >
              Supply balance {formatSliceTokenOrUSD(supplyBalance, 5)}
            </Text>

            <Flex gap='8px'>
              <Image
                width={24}
                height={24}
                src={`/collaterals/${marketData.asset}.svg`}
                alt='WETH'
              />

              <Input
                p='0'
                h='30px'
                bg='none'
                border='0px'
                outline='none'
                lineHeight='110%'
                fontWeight='600'
                placeholder='0.00'
                fontSize={{ base: '20px', sm: '24px' }}
                value={value}
                isDisabled={isAbsoluteLoadingBorrowTokens}
                readOnly={!isBalance}
                onBlur={onBlur}
                onChange={onChange}
                _focus={{ border: 'none', boxShadow: 'none' }}
              />

              <Button
                variant='maxButtons'
                onClick={onMax}
              >
                Max
              </Button>
            </Flex>

            <Text
              size='small14400'
              gridArea='3/ span 2'
            >
              ${' '}
              {formatSliceTokenOrUSD(
                Number(marketData.supplyBalance) * marketData.price <
                  parseUnits('0.01', Number(marketData.decimals))
                  ? '0.01'
                  : formatSliceNumber(
                      (
                        Number(formatUnits(marketData.supplyBalance, Number(marketData.decimals))) *
                        marketData.price
                      ).toString()
                    ),
                2
              )}
            </Text>

            <View.Condition if={isNotEnough}>
              <Text
                color='brand.1200'
                size='small14500140'
                gridArea='4/ span 2'
              >
                Not enough balance
              </Text>
            </View.Condition>
          </Flex>

          <Grid
            p='16px'
            gap='8px'
            gridTemplateColumns='repeat(2, 1fr)'
            border='1px solid'
            borderColor='brand.600'
            borderRadius='8px'
          >
            <Text
              color='brand.550'
              size='small14500120'
              gridArea='1/ span 2'
            >
              Transaction Overview
            </Text>

            <Text size='small16500140'>Remaining Amount</Text>

            <Flex
              gap='8px'
              alignItems='center'
              justifySelf='flex-end'
            >
              <Text size='small16500140'>
                {formatSliceTokenOrUSD((Number(currentBalance) - Number(value)).toString(), 5)}
              </Text>

              <Text
                color='brand.550'
                size='small16500140'
              >
                {marketData.asset}
              </Text>
            </Flex>
          </Grid>

          <Box
            w='100%'
            m='10px 0 '
          >
            <Divider w={400} />
          </Box>

          <Grid gridTemplateColumns='repeat(2, 1fr)'>
            <Text
              size='small14400'
              color='brand.550'
            >
              Network Cost
            </Text>

            <Flex
              alignItems='center'
              justifySelf='flex-end'
              columnGap='8px'
            >
              <GasIcon fill='brand.550' />

              <Text
                color='brand.550'
                size='small14400'
              >
                ${formatSliceTokenOrUSD(formatUnits(networkCost, 18), 5)}
              </Text>
            </Flex>
          </Grid>
        </View.Condition>

        <View.Condition if={isAbsoluteLoadingBorrowTokens}>
          <Grid rowGap='24px'>
            <Loader />
          </Grid>
        </View.Condition>

        <View.Condition if={!isAbsoluteLoadingBorrowTokens && isSuccessful}>
          <TransactionSuccessfully
            href={`${CurrentNetworkExplorerURL[marketData.chainId]}/tx/${txHash}`}
          />
        </View.Condition>

        <View.Condition if={!isAbsoluteLoadingBorrowTokens && !isSuccessful}>
          <Button
            m='15px 0'
            isDisabled={isNotEnough || value === '' || isAbsoluteLoadingApprove}
            onClick={onClickButton}
            variant='actionButtons'
          >
            {isAllowed ? 'Withdraw' : 'Allow'}
          </Button>
        </View.Condition>
      </Grid>
    </Grid>
  );
};

export default WithdrawWidget;
