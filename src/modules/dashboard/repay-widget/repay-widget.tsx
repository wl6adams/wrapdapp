import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { formatUnits } from 'viem';
import {
  useAccount,
  useBalance,
  useEstimateGas,
  useGasPrice,
  useReadContract,
  useSwitchChain,
} from 'wagmi';
import { Box, Button, Flex, Grid, Input, Text, useDisclosure } from '@chakra-ui/react';

import { useStore as supplyStore } from '@/modules/supply-widget/store';
import { TransactionSuccessfully } from '@/modules/transaction-successfully/transaction-successfully';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import Loader from '@/modules/widget/loader/loader';
import { GasIcon } from '@/shared/chakra-ui/icons';
import { ACTION_SUPPLY_NATIVE_TOKEN } from '@/shared/consts/constant';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { GAEvent } from '@/shared/lib/gtag';
import {
  formatSliceNumber,
  getBigNumber,
  isValidNumericInput,
  removeCommas,
} from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { View } from '@/shared/ui/view';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { TokenToABI } from '@/shared/web3/abi/TokenToABI';
import { contractsConfig, CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { useApproveToken, useBuyTokensWithETH, useBuyTokensWithToken } from '@/shared/web3/hook';
import { TableData } from '@/shared/web3/types';
import { useDashboardStore } from '@/store/dashboard';
import { ModalsLayout } from '@/widgets/modal';

//TODO refactor code
const RepayWidget = ({
  reGetData,
  openModal,
  marketData,
  onOpenModal,
  onCloseModal,
  ...styles
}: {
  openModal: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
  reGetData: () => void;
  marketData: TableData;
  [key: string]: any;
}) => {
  const [value, setValue] = useState<string>('');

  const [isSuccessfulApprove, setIsSuccessfulApprove] = useState<boolean>(false);

  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

  const { approveToken, isAbsoluteLoadingApprove } = useApproveToken();

  const { buyTokensWithETH, isAbsoluteLoadingBuy, txHash: txHashNative } = useBuyTokensWithETH();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { currentTokenData, setCurrentTokenData } = supplyStore();

  const { setReloadData } = useDashboardStore();

  const { setTokenCount, setIsNotEnough, showStep, setShowStep } = useStore();

  const { switchChainAsync } = useSwitchChain();

  const { isConnected, chainId, address } = useAccount();

  const {
    buyTokensWithToken,
    isAbsoluteLoadingBuyToken,
    txHash: txHashToken,
  } = useBuyTokensWithToken();

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
  });

  const { data: tokenBalance } = useBalance({
    address: address,
    token: marketData.baseTokenAddress,
    blockTag: 'latest',
  });

  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20ABI,
    address: currentTokenData.addressFrom,
    functionName: 'allowance',
    args: address && !currentTokenData.isNative ? [address, currentTokenData.addressTo] : undefined,
    blockTag: 'latest',
  });

  const { data: gasPrice } = useGasPrice();

  const { data: estimateGas } = useEstimateGas({
    to: currentTokenData.bulker,
    value: getBigNumber(value.toString(), currentTokenData.decimals),
  });

  const balance = useMemo(
    () => (currentTokenData.isNative ? userEthBalance : tokenBalance),
    [currentTokenData.isNative, userEthBalance, tokenBalance]
  );

  const isBalance = !!balance?.value ? balance?.value > BigInt(0) : false;

  const debounceInput = useDebounce(Number(value));

  const isNotEnough = useMemo(
    () =>
      Number(removeCommas(value)) > Number(balance?.formatted || 0) || balance?.value === BigInt(0),
    [value, balance]
  );

  const isNeedApprove = useMemo(() => {
    if (getBigNumber(value, currentTokenData.decimals) <= BigInt(0) || currentTokenData.isNative)
      return false;

    const inputValue = getBigNumber(value, currentTokenData.decimals);

    return BigInt(usdtAllowance || 0) < inputValue;
  }, [usdtAllowance, value, currentTokenData.decimals, currentTokenData.isNative]);

  const balanceInUsd = useMemo(
    () => Math.floor(Number(value) * (marketData?.price || 0) * 100) / 100,
    [value, marketData?.price]
  );

  const isLoading = useMemo(
    () => isAbsoluteLoadingBuyToken || isAbsoluteLoadingBuy || isAbsoluteLoadingApprove,
    [isAbsoluteLoadingBuyToken, isAbsoluteLoadingBuy, isAbsoluteLoadingApprove]
  );

  const networkCost = useMemo(() => {
    if (estimateGas && gasPrice) {
      return estimateGas * gasPrice;
    }

    return BigInt(0);
  }, [gasPrice, estimateGas]);

  const remainingDebt = useMemo(() => {
    const borrowAmount = formatUnits(marketData.borrowBalance, Number(marketData.decimals));

    return Number(borrowAmount) * 1.01;
  }, [marketData]);

  const isFullDebt = useMemo(() => Number(value) >= remainingDebt, [remainingDebt, value]);

  const onBlur = () => {
    if (value) {
      const formattedValue = formatSliceNumber(value, 18);

      setValue(formattedValue);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeCommas(e.target.value);

    if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
      setValue(rawValue);
    }
  };

  const onChangeUserPositionClick = () => {
    if (!address) {
      onOpen();
    } else {
      if (chainId && isConnected && marketData) {
        if (chainId !== marketData.chainId) {
          switchChainAsync({ chainId: marketData.chainId }).then(() => {
            setCurrentTokenData(contractsConfig.token[marketData.chainId][marketData.asset]);
            setShowStep(1);
            onOpenModal();
          });
          return;
        }
      }
      setCurrentTokenData(contractsConfig.token[marketData.chainId][marketData.asset]);
      setShowStep(1);
      onOpenModal();
    }
  };

  const onMaxClick = () => {
    if (remainingDebt && !isLoading) {
      setValue(remainingDebt.toString());
    }
  };

  const onSupplyTokenClick = () => {
    if (currentTokenData.isNative) {
      const data = [
        currentTokenData.addressTo,
        address,
        getBigNumber(value, currentTokenData.decimals),
      ];

      const supplyWETH = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint'], data);

      buyTokensWithETH(
        {
          abi: BulkerABI,
          address: currentTokenData.bulker,
          functionName: 'invoke',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          args: address && [[ACTION_SUPPLY_NATIVE_TOKEN], [supplyWETH]],
          value: getBigNumber(value, currentTokenData.decimals),
        },
        {
          onSuccess: () => {
            setIsSuccessful(true);
            GAEvent(
              'transaction',
              'event',
              `buy native ${address}_${value}_${marketData.chainId}_${marketData.asset}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
          },
        }
      );
    } else {
      buyTokensWithToken(
        {
          abi: TokenToABI,
          address: currentTokenData.addressTo,
          functionName: 'supply',
          args: [currentTokenData.addressFrom, getBigNumber(value, currentTokenData.decimals)],
        },
        {
          onSuccess: () => {
            setIsSuccessful(true);
            GAEvent(
              'transaction',
              'event',
              `buy token ${address}_${value}_${marketData.chainId}_${marketData.asset}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
          },
        }
      );
    }
  };

  const onSubmit = () => {
    if (getBigNumber(value, currentTokenData.decimals) <= BigInt(0)) {
      return;
    }

    if (currentTokenData.isNative) {
      onSupplyTokenClick();
    } else {
      if (isNeedApprove) {
        approveToken(
          {
            abi: ERC20ABI,
            address: currentTokenData.addressFrom,
            functionName: 'approve',
            args: [currentTokenData.addressTo, getBigNumber(value, currentTokenData.decimals)],
          },
          {
            onSuccess: () => {
              setIsSuccessfulApprove(true);
              GAEvent(
                'transaction',
                'event',
                `approve ${address}_${value}_${marketData.chainId}_${marketData.asset}`
              );
            },
            onError: (error, variables, context) => {
              console.log('--context--', context);
              console.log('--variables--', variables);
              console.log('--error--', error);
            },
          }
        );
      } else {
        onSupplyTokenClick();
      }
    }
  };

  useEffect(() => {
    if (!address) {
      onCloseModal();
      setShowStep(1);
    }
  }, [address]);

  useEffect(() => {
    refetchUserEthBalance();
  }, [showStep]);

  useEffect(() => {
    setTokenCount(value);
  }, [debounceInput]);

  useEffect(() => {
    setIsNotEnough(isNotEnough);
  }, [isNotEnough]);

  useEffect(() => {
    refetchAllowance();
  }, [isAbsoluteLoadingApprove]);

  useEffect(() => {
    if (!isAbsoluteLoadingBuyToken && !isAbsoluteLoadingBuy && isSuccessful) {
      reGetData();
    }
  }, [isAbsoluteLoadingBuyToken, isAbsoluteLoadingBuy, isSuccessful]);

  useEffect(() => {
    if (!isAbsoluteLoadingApprove && isSuccessfulApprove) {
      refetchAllowance();
    }
  }, [isAbsoluteLoadingApprove, isSuccessfulApprove]);

  return (
    <>
      <Button
        variant='lendMoreButtons'
        {...styles}
        onClick={onChangeUserPositionClick}
      >
        Repay
      </Button>

      <ModalsLayout
        isHiddenClose
        isOpen={isOpen}
        onClose={onClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <WalletConnect
          closeModal={() => {
            onClose();
            onOpenModal();
          }}
        />
      </ModalsLayout>

      <ModalsLayout
        isHiddenClose
        isOpen={openModal}
        onClose={() => {
          setReloadData(true);
          onCloseModal();
        }}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <Grid gridTemplateColumns='1fr'>
          <Flex
            borderBottom='1px solid'
            borderColor='brand.400'
            p='16px 24px'
          >
            <Text size='small16500140'>Repay</Text>
          </Flex>

          <Grid
            gridTemplateColumns='1fr'
            p='16px 24px'
            gap='8px'
          >
            {isSuccessful && !isLoading ? null : (
              <Grid
                p='16px'
                rowGap='8px'
                columnGap='8px'
                borderRadius='8px'
                border='1px solid'
                alignItems='center'
                position='relative'
                gridTemplateColumns='24px 1fr'
                opacity={!isBalance ? 0.5 : 1}
                bg={isNotEnough ? 'brand.1125' : 'brand.whiteAlpha.200'}
                borderColor={isNotEnough ? 'brand.1275' : 'transparent'}
              >
                <Text
                  size='small14500140'
                  gridArea='1/ span 2'
                >
                  Amount
                </Text>

                <Image
                  width={24}
                  height={24}
                  src={`/collaterals/${marketData.asset}.svg`}
                  alt={marketData.asset}
                />

                <Input
                  border='0px'
                  h='30px'
                  bg='none'
                  _focus={{ border: 'none', boxShadow: 'none' }}
                  outline='none'
                  fontSize={{ base: '20px', sm: '24px' }}
                  lineHeight='110%'
                  fontWeight='600'
                  p='0'
                  placeholder='0.00'
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  readOnly={!isBalance || isLoading}
                />

                <Button
                  onClick={onMaxClick}
                  position='absolute'
                  right={{ base: '15px', sm: '20px' }}
                  top='50%'
                  w='110px'
                  transform='translate( 0, -50%)'
                  variant='maxButtons'
                  zIndex='23'
                >
                  Full Amount
                </Button>

                <Text
                  gridArea='3/ span 2'
                  size='small14400'
                >
                  {balanceInUsd} USD
                </Text>

                {isNotEnough ? (
                  <Text
                    position='absolute'
                    bottom='15px'
                    right={{ base: '15px', sm: '20px' }}
                    color='brand.1200'
                    size='small14500140'
                  >
                    Not enough balance
                  </Text>
                ) : (
                  <Text
                    size='small14500120'
                    color='brand.550'
                    position='absolute'
                    bottom='15px'
                    right={{ base: '15px', sm: '20px' }}
                  >
                    Wallet balance{' '}
                    {formatSliceNumber(
                      (balance?.formatted || 0).toString(),
                      currentTokenData.decimals
                    )}
                  </Text>
                )}
              </Grid>
            )}

            <Grid
              gridTemplateColumns='repeat(2, 1fr)'
              border='1px solid'
              borderColor='brand.600'
              borderRadius='8px'
              p='16px'
              gap='8px'
            >
              <Text size='small16500140'>Debt</Text>

              <Flex
                alignItems='center'
                gap='8px'
                justifySelf='flex-end'
              >
                <Text size='small16500140'>{remainingDebt.toString()}</Text>
                <Text
                  size='small16500140'
                  color='brand.550'
                >
                  {marketData.asset}
                </Text>
              </Flex>
            </Grid>

            <Box w='100%'>
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

                <Text size='small14400'>
                  {formatSliceNumber(formatUnits(networkCost, 18), 6)} USD
                </Text>
              </Flex>
            </Grid>

            <View.Condition if={Boolean(isSuccessful && !isLoading)}>
              <Grid gap='16px'>
                <TransactionSuccessfully
                  isFullDebt={isFullDebt}
                  href={`${CurrentNetworkExplorerURL[marketData.chainId]}/tx/${currentTokenData.isNative ? txHashNative : txHashToken}`}
                />
              </Grid>
            </View.Condition>

            <View.Condition if={Boolean(!isSuccessful && isLoading)}>
              <Grid
                rowGap='24px'
                bgPosition='center'
              >
                <Loader />
              </Grid>
            </View.Condition>

            <View.Condition if={Boolean(!isSuccessful && !isLoading)}>
              <Button
                m='15px 0'
                isDisabled={isNotEnough || value === ''}
                onClick={onSubmit}
                variant='actionButtons'
              >
                {isNeedApprove ? 'Approve' : 'Submit Transaction'}
              </Button>
            </View.Condition>
          </Grid>
        </Grid>
      </ModalsLayout>
    </>
  );
};

export default RepayWidget;
