import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ethers, utils } from 'ethers';
import { Divider } from 'src/shared/ui/divider';
import { formatUnits } from 'viem';
import {
  useAccount,
  useBalance,
  useEstimateGas,
  useFeeData,
  useGasPrice,
  useReadContract,
  useSwitchChain,
} from 'wagmi';
import { Box, Button, Flex, FormLabel, Grid, Input, Switch, Text } from '@chakra-ui/react';

import DisconnectWallet from '@/modules/supply-widget/disconnect-wallet/disconnect-wallet';
import { TransactionSuccessfully } from '@/modules/transaction-successfully/transaction-successfully';
import Loader from '@/modules/widget/loader/loader';
import { GasIcon } from '@/shared/chakra-ui/icons';
import {
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_NATIVE_TOKEN,
} from '@/shared/consts/constant';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  cleanNumber,
  findCollateralByHealthFactor,
  findHealthFactorByCollateralInput,
  formatSliceNumber,
  formatSliceTokenOrUSD,
  getBigNumber,
  getLendTransactionFee,
  getSliderColor,
  getTokenPrice,
  isValidNumericInput,
  removeCommas,
} from '@/shared/lib/utils';
import { View } from '@/shared/ui/view';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { contractsConfig, CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { BULKER_ADDRESS } from '@/shared/web3/config';
import { useApproveToken, useBorrowTokens, useWithdraw } from '@/shared/web3/hook';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { AllCollateralData } from '@/shared/web3/types';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useDashboardStore } from '@/store/dashboard';
import { useRPCStore } from '@/store/rpc';

const DEFAULT_RISK = 100;

interface EditCollateralProps {
  title: string;

  currentCollateralData: AllCollateralData;

  maxWithdrawAmount: string;

  collateralAction: 'plus' | 'minus';

  openWalletConnect: () => void;

  onClose: () => void;

  reGetData: () => void;
}

const EditCollateral: FC<EditCollateralProps> = ({
  title,

  maxWithdrawAmount,

  collateralAction,

  openWalletConnect,

  currentCollateralData,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [value, setValue] = useState<string>('');

  const debounceInput = useDebounce(Number(value));

  const [added, setAdded] = useState(false);

  const [isSuccessful, setIsSuccessful] = useState(false);

  const [liqRisk, setLiqRisk] = useState<string>('1.5');

  const [maxFeePerGas, setMaxFeePerGas] = useState(BigInt(0));
  const [estimateGas, setEstimateGas] = useState(BigInt(0));
  const [estimatedGasPriceETH, setEstimatedGasPriceETH] = useState(0);

  const { selectedPosition, borrowedCards } = useDashboardStore();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const selectedCard = borrowedCards[selectedPosition];

  const { data: estimateGasCalc } = useEstimateGas({
    to: selectedCard.cometAddress,
    value: getBigNumber(value, currentCollateralData.decimals),
  });

  const { approveToken, isAbsoluteLoadingApprove } = useApproveToken();

  const { withdraw, isAbsoluteLoadingBorrowTokens, txHash: txHashWithdraw } = useWithdraw();

  const {
    borrowTokens: supplyToken,
    isAbsoluteLoadingBorrowTokens: isAbsoluteLoadingSupplyToken,
    txHash: txHashBorrow,
  } = useBorrowTokens();

  const { switchChain } = useSwitchChain();

  const { isConnected, address, chainId } = useAccount();

  const { data: gasPrice } = useGasPrice();

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedCard.chainId,
  });

  const isDisableWallet = !isConnected || !address;

  const isLoading =
    isAbsoluteLoadingApprove || isAbsoluteLoadingBorrowTokens || isAbsoluteLoadingSupplyToken;

  const maxLiqRisk = useMemo(() => {
    return (
      (Number(formatUnits(currentCollateralData.liquidateCollateralFactor, 18)) /
        Number(formatUnits(currentCollateralData.liquidationFactor, 18))) *
      DEFAULT_RISK
    );
  }, [currentCollateralData]);

  const collateralPrice = useMemo(() => {
    if (!selectedCard) {
      return 0;
    }
    return getTokenPrice(selectedCard.asset, currentCollateralData.price, selectedCard.price);
  }, [borrowedCards, selectedPosition]);

  const borrowAmount = useMemo(() => {
    return Number(formatUnits(selectedCard.borrowBalance, Number(selectedCard.decimals)));
  }, [selectedCard]);

  const isWETH = currentCollateralData.symbol === 'WETH' && !isChecked;

  const maxBalance = useMemo(() => {
    if (collateralAction === 'plus' && isWETH) {
      const leftBalance = Number(userEthBalance?.formatted || '0') - estimatedGasPriceETH;

      return leftBalance ? leftBalance.toString() : '0';
    }

    if (collateralAction === 'plus' && !isWETH) {
      return formatUnits(currentCollateralData.balanceOf, currentCollateralData.decimals);
    }

    return maxWithdrawAmount;
  }, [
    isWETH,
    collateralAction,
    userEthBalance,
    currentCollateralData,
    maxWithdrawAmount,
    estimatedGasPriceETH,
  ]);

  const isNoBalance = Number(value) > Number(maxBalance);

  const isNeedApprove = useMemo(() => {
    return (
      !isWETH &&
      Number(formatUnits(currentCollateralData.allowance, currentCollateralData.decimals)) <
        Number(value)
    );
  }, [isWETH, currentCollateralData, value]);

  const currentHealthFactor = useMemo(() => {
    const collateralsSupply = Number(
      formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals)
    );

    const liqFactor = Number(formatUnits(currentCollateralData.liquidationFactor, 18));

    const healthFactor = findHealthFactorByCollateralInput({
      borrowAmount,
      borrowPrice: selectedCard.price,
      collateralValue: collateralsSupply,
      collateralPrice,
      liqFactor,
    });

    return Math.max(1, healthFactor);
  }, [currentCollateralData, collateralPrice, selectedCard, borrowAmount]);

  const minLiqRisk = useMemo(() => {
    const liquidationFactor = Number(formatUnits(currentCollateralData.liquidationFactor, 18));

    const collateralFactor = Number(
      formatUnits(currentCollateralData.liquidateCollateralFactor, 18)
    );

    const result = liquidationFactor / collateralFactor;

    const response = result < 1 ? 1 : result;

    return Number(response.toFixed(0));
  }, [currentCollateralData]);

  const isDisabled = useMemo(() => {
    if (isNoBalance || selectedCard.chainId !== chainId) {
      return true;
    }
    if (collateralAction === 'minus') {
      return !(Number(value) > 0 && Number(value) <= Number(maxBalance));
    }

    if (collateralAction === 'plus') {
      return isNeedApprove || !(Number(value) > 0 && Number(value) <= Number(maxBalance));
    }
    return false;
  }, [isNoBalance, value, maxBalance, isNeedApprove, chainId, selectedCard]);

  const networkCost = useMemo(() => {
    if (estimateGasCalc && gasPrice) {
      return estimateGasCalc * gasPrice;
    }
    return BigInt(0);
  }, [gasPrice, estimateGasCalc]);

  const remainingCollateral = useMemo(() => {
    const amount = Number(
      formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals)
    );

    if (collateralAction === 'plus') {
      return amount + Number(value);
    }

    if (collateralAction === 'minus') {
      return amount - Number(value);
    }
    return 0;
  }, [collateralAction, value]);

  const currentCollateralUsd = useMemo(() => {
    return (
      Number(formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals)) *
      collateralPrice
    ).toString();
  }, [currentCollateralData, collateralPrice]);

  const currentCollateralAmount = useMemo(() => {
    if (collateralAction !== 'plus') {
      return formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals);
    }

    return isWETH
      ? userEthBalance?.formatted || '0'
      : formatUnits(currentCollateralData.balanceOf, currentCollateralData.decimals);
  }, [isWETH, collateralAction, currentCollateralData, userEthBalance]);

  const newWorkCost = useMemo(() => {
    if (collateralAction !== 'plus') return formatSliceTokenOrUSD(formatUnits(networkCost, 18), 5);

    return formatSliceTokenOrUSD(`${estimatedGasPriceETH}`, 5);
  }, [collateralAction, networkCost, estimatedGasPriceETH]);

  // Change input when change factor
  const calculateCollateralsOnChangeHF = useCallback(
    (healthFactor: number) => {
      if (borrowAmount <= 0) {
        setLiqRisk('0');
        return;
      }

      const supplyTokens = Number(
        formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals)
      );

      const borrowUSD = borrowAmount * selectedCard.price;

      const liqFactor = Number(formatUnits(currentCollateralData.liquidationFactor, 18));

      const countInAsset = findCollateralByHealthFactor({
        borrowUSD,
        marketPrice: selectedCard.price,
        healthFactor,
        liqFactor,
        collateralPrice,
      });

      const maxResult = formatSliceNumber(maxBalance, 18);

      const result =
        collateralAction === 'plus' ? countInAsset - supplyTokens : supplyTokens - countInAsset;

      const response =
        collateralAction === 'minus' && result > Number(maxResult) ? Number(maxResult) : result;

      setValue((response < 0 ? 0 : response).toString());
    },
    [collateralAction, selectedCard, borrowAmount]
  );

  const calculateHFByCollateral = useCallback(
    (inputValue: number) => {
      if (!borrowAmount) {
        setLiqRisk('1.5');
        return;
      }
      const supplyTokens = Number(
        formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals)
      );

      const collateralValue =
        collateralAction === 'plus' ? inputValue + supplyTokens : supplyTokens - inputValue;

      const liqFactor = Number(formatUnits(currentCollateralData.liquidationFactor, 18));

      const healthFactor = findHealthFactorByCollateralInput({
        borrowAmount,
        borrowPrice: selectedCard.price,
        collateralValue,
        collateralPrice,
        liqFactor,
      });

      setLiqRisk(healthFactor.toFixed(1));
    },
    [currentCollateralData, selectedCard, borrowAmount, collateralPrice]
  );

  const approveCollateral = () => {
    if (Number(value) <= 0 || !selectedCard) return;

    approveToken(
      {
        abi: ERC20ABI,
        address: currentCollateralData.asset,
        functionName: 'approve',
        args: [
          selectedCard.cometAddress,
          getBigNumber(value, Number(currentCollateralData.decimals)),
        ],
        ...(maxFeePerGas && { gasPrice: maxFeePerGas }),
        ...(estimateGas && { gas: estimateGas }),
      },
      {
        onSuccess: () => {
          setIsSuccessful(true);
        },
        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);

          setAdded(false);
        },
      }
    );
  };

  const { data: isAllowed, refetch: refetchIsAllowed } = useReadContract({
    abi: CometABI,
    address: selectedCard?.cometAddress,
    functionName: 'isAllowed',
    args:
      address && selectedCard
        ? [address, BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedCard?.asset]]
        : undefined,
    blockTag: 'latest',
  });

  const withDrawInNativeToken = () => {
    const bulkerAddress =
      contractsConfig.token[chainId || DEFAULT_CHAIN_ID][selectedCard.asset].bulker;

    const data = [
      selectedCard.cometAddress,
      address,
      getBigNumber(value, currentCollateralData.decimals),
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

  const executeWithdraw = () => {
    withdraw(
      {
        abi: CometABI,
        address: selectedCard.cometAddress,
        functionName: 'withdraw',
        args: [currentCollateralData.asset, getBigNumber(value, currentCollateralData.decimals)],
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

  const onApproveToken = () => {
    approveToken(
      {
        abi: CometABI,
        address: selectedCard?.cometAddress || '0x',
        functionName: 'allow',
        args: [BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedCard?.asset || ''], true],
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

  const onSubmit = () => {
    if (Number(value) <= 0 || !selectedCard) return;

    if (collateralAction === 'minus') {
      if (!isAllowed) {
        onApproveToken();
        return;
      }

      if (isWETH) {
        withDrawInNativeToken();
      } else {
        executeWithdraw();
      }

      return;
    }

    if (collateralAction === 'plus') {
      if (!isAllowed) {
        onApproveToken();
        return;
      }
      const actions: `0x${string}`[] = [isWETH ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN];

      const encoded = isWETH
        ? [
            utils.defaultAbiCoder.encode(
              ['address', 'address', 'uint'],
              [
                selectedCard.cometAddress,
                address,
                getBigNumber(value, currentCollateralData.decimals),
              ]
            ) as `0x${string}`,
          ]
        : [
            utils.defaultAbiCoder.encode(
              ['address', 'address', 'address', 'uint'],
              [
                selectedCard.cometAddress,
                address,
                currentCollateralData.asset,
                getBigNumber(value, currentCollateralData.decimals),
              ]
            ) as `0x${string}`,
          ];

      const variable = {
        abi: BulkerABI,
        address: BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedCard.asset],
        functionName: 'invoke',
        args: [actions, encoded],
        ...(isWETH && { value: getBigNumber(value, currentCollateralData.decimals) }),
        ...(maxFeePerGas && { gasPrice: maxFeePerGas }),
        ...(estimateGas && { gas: estimateGas }),
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      supplyToken(variable, {
        onSuccess: () => {
          setIsSuccessful(true);
        },
        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);
        },
      });
    }
  };

  const onBlur = () => {
    if (!value) return;

    setValue(value);
  };

  const onAddOrRemove = () => {
    if (isNoBalance) return;

    setAdded((prev) => !prev);

    if (collateralAction === 'plus' && isNeedApprove) {
      approveCollateral();
    }
  };

  const onMax = useCallback(() => {
    const formattedValue = formatSliceNumber(maxBalance, 18);

    calculateHFByCollateral(Number(maxBalance));

    setValue(formattedValue);
  }, [maxBalance, currentCollateralAmount]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = removeCommas(e.target.value);

      if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
        calculateHFByCollateral(Number(rawValue));

        setValue(rawValue);
      }
    },
    [calculateHFByCollateral]
  );

  const onLiqRiskChange = useCallback(
    (target: string) => {
      const input = cleanNumber(target);

      if (Number(input) < 0 || Number(input) > 100) return;

      if (
        (collateralAction === 'minus' && Number(input) > currentHealthFactor) ||
        (collateralAction === 'plus' && Number(input) < currentHealthFactor)
      ) {
        const adjustedHealthFactor = currentHealthFactor.toFixed(0);

        setLiqRisk(adjustedHealthFactor);

        calculateCollateralsOnChangeHF(Number(adjustedHealthFactor));
      } else {
        setLiqRisk(input);

        calculateCollateralsOnChangeHF(Number(input));
      }
    },
    [currentHealthFactor]
  );

  const { data } = useFeeData({
    chainId: selectedCard.chainId,
  });

  useEffect(() => {
    if (collateralAction === 'minus') {
      return;
    }
    if (!selectedCard || !address || !currentCollateralData || !userEthBalance?.value || !data) {
      return;
    }
    (async () => {
      const rightRPC = getRPCConfig(
        address,
        publicRPC,
        myWalletRPC,
        customRPC,
        lastChange,
        customRPCList
      );

      const response = await getLendTransactionFee(
        selectedCard.chainId,
        currentCollateralData.decimals,
        selectedCard.cometAddress,
        currentCollateralData.asset,
        contractsConfig.token[chainId || DEFAULT_CHAIN_ID][selectedCard.asset].bulker,
        address,
        userEthBalance.value,
        isWETH,
        value,
        isNeedApprove,
        true,
        rightRPC
      );

      if (data?.maxFeePerGas && response?.estimateGas) {
        setEstimateGas(response.estimateGas);
        setMaxFeePerGas(data.maxFeePerGas);

        setEstimatedGasPriceETH(Number(formatUnits(data.maxFeePerGas * response.estimateGas, 18)));
      }
    })();
  }, [
    address,
    value,
    isNeedApprove,
    isWETH,
    selectedCard,
    currentCollateralData,
    chainId,
    userEthBalance,
    data,
  ]);

  useEffect(() => {
    if (selectedCard.chainId !== chainId) {
      switchChain({ chainId: selectedCard.chainId });
    }
  }, [selectedCard, chainId, switchChain]);

  return (
    <Box>
      <Box
        p='17px 24px'
        bg='brand.750'
        borderBottom='1px solid'
        borderRadius='16px 16px 0 0'
        borderBottomColor='brand.400'
      >
        <Text
          color='brand.50'
          size='medium18500120'
        >
          {title}
        </Text>
      </Box>

      <Flex
        gap='24px'
        p='32px 24px'
        alignItems='center'
        flexDirection='column'
      >
        <View.Condition if={!isSuccessful && !isLoading}>
          <DisconnectWallet
            moveConnectWallet={openWalletConnect}
            isDisabled={isDisableWallet}
          />

          <Divider />

          <Flex
            w='100%'
            gap='10px'
            flexDirection='column'
            justifyContent='space-between'
            alignItems='flex-start'
          >
            <Text
              gridArea='span 2/ 1'
              color='brand.50'
              size='medium18500120'
            >
              Current Collateral
            </Text>

            <Flex
              w='100%'
              alignItems='center'
              justifyContent='space-between'
            >
              <Grid
                gap='5px'
                alignItems='center'
                gridTemplateColumns='max-content max-content'
              >
                <Image
                  src={`/collaterals/${currentCollateralData.symbol}.svg`}
                  alt={currentCollateralData.symbol}
                  width={32}
                  height={32}
                />
                <Text
                  color='brand.50'
                  size='medium18500120'
                >
                  {formatSliceTokenOrUSD(
                    formatUnits(currentCollateralData.totalSupply, currentCollateralData.decimals),
                    5
                  )}{' '}
                  {isWETH ? 'ETH' : currentCollateralData.symbol}
                </Text>
              </Grid>

              <Text
                color='brand.550'
                size='small14500140'
              >
                {formatSliceTokenOrUSD(currentCollateralUsd)} USD
              </Text>
            </Flex>
          </Flex>

          <Grid
            w='100%'
            gap='8px'
          >
            <View.Condition if={Boolean(borrowAmount)}>
              <Flex
                gap='25px'
                p='16px'
                alignItems='center'
                justifyContent='space-between'
                bg='brand.400'
                border='1px solid'
                borderRadius='8px'
                borderColor='brand.600'
              >
                <Flex
                  flexDirection='column'
                  gap='10px'
                >
                  <Text size='medium18500120'>
                    Current Health Factor {currentHealthFactor.toFixed(0)}
                  </Text>
                  <Text
                    size='small14500120'
                    color='brand.550'
                  >
                    {collateralAction === 'plus'
                      ? `Max Health Factor ${maxLiqRisk.toFixed(0)}`
                      : `Min Health Factor ${minLiqRisk.toFixed(0)}`}
                  </Text>
                </Flex>

                <Input
                  p='6.5px'
                  w='74px'
                  h='38px'
                  borderRadius='90px'
                  textAlign='center'
                  outline='none'
                  fontSize='18px'
                  lineHeight='270%'
                  fontWeight='500'
                  _focus={{ borderColor: getSliderColor(Number(liqRisk)), boxShadow: 'none' }}
                  color={getSliderColor(Number(liqRisk))}
                  borderColor={getSliderColor(Number(liqRisk))}
                  variant='outline'
                  value={liqRisk}
                  onChange={(event) => onLiqRiskChange(event.target.value)}
                />
              </Flex>
            </View.Condition>

            <Flex
              w='100%'
              p='16px'
              bg='brand.400'
              border='1px solid'
              borderRadius='8px'
              borderColor='brand.600'
              flexDirection='column'
            >
              <Flex
                alignItems='center'
                justifyContent='space-between'
                mb='5px'
              >
                <Text
                  w='fit-content'
                  size='small14500120'
                  color='brand.550'
                >
                  Current Collateral: {formatSliceTokenOrUSD(currentCollateralAmount, 5)}{' '}
                  {isWETH ? 'ETH' : currentCollateralData.symbol}
                </Text>

                {currentCollateralData.symbol === 'WETH' && (
                  <Flex alignItems='center'>
                    <FormLabel
                      htmlFor='userPosition'
                      m='0 10px 0 0'
                      whiteSpace='nowrap'
                    >
                      <Text
                        size='small14500120'
                        color='brand.550'
                      >
                        {collateralAction === 'plus' ? 'Add as WETH' : 'Reduce as  as WETH'}
                      </Text>
                    </FormLabel>

                    <Switch
                      id='userPosition'
                      isChecked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                  </Flex>
                )}
              </Flex>

              <Flex justifyContent='space-between'>
                <Grid
                  w='100%'
                  mr='10px'
                >
                  <Flex
                    gap='8px'
                    h='35px'
                    padding='4.5px 6px 4.5px 0'
                    w='100%'
                  >
                    <Image
                      style={{ gridArea: 'span 2/ 1' }}
                      width={24}
                      height={24}
                      src={`/collaterals/${currentCollateralData.symbol}.svg`}
                      alt={currentCollateralData.symbol}
                    />

                    <Flex
                      gap='8px'
                      alignItems='center'
                      justifyContent='space-between'
                      w='100%'
                    >
                      <Input
                        border='0px'
                        h='30px'
                        bg='none'
                        w='100%'
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
                      />
                    </Flex>
                  </Flex>

                  <Text
                    color='brand.900'
                    ml='34px'
                    size='small14120500'
                    textAlign='start'
                  >
                    {formatSliceTokenOrUSD((Number(value) * collateralPrice).toString())} USD
                  </Text>
                </Grid>

                <Grid gap='5px'>
                  <Button
                    w='80px'
                    h='35'
                    variant='tableButtons'
                    color='brand.100'
                    bg='brand.375'
                    onClick={onMax}
                  >
                    Max
                  </Button>

                  {collateralAction === 'plus' && !isWETH && (
                    <Button
                      w='80px'
                      h='35'
                      variant={added && !isNeedApprove ? 'tableButtonsRed' : 'tableButtons'}
                      bg={isNoBalance ? 'rgba(255, 255, 255, 0.15)' : 'brand.600'}
                      onClick={onAddOrRemove}
                      isDisabled={debounceInput <= 0}
                    >
                      {added && !isNeedApprove ? 'REMOVE' : 'ADD'}
                    </Button>
                  )}
                </Grid>
              </Flex>
            </Flex>

            <Grid gap='15px'>
              <Flex justifyContent='space-between'>
                <Text
                  color='brand.550'
                  size='small14400'
                >
                  <View.Condition if={collateralAction === 'plus'}>
                    Total collaterals after transaction
                  </View.Condition>

                  <View.Condition if={collateralAction === 'minus'}>
                    Remaining collaterals
                  </View.Condition>
                </Text>

                <Flex
                  gap='10px'
                  flexDirection='column'
                  alignItems='flex-end'
                >
                  <Text
                    color='brand.50'
                    size='small14500120'
                  >
                    {formatSliceTokenOrUSD(remainingCollateral.toString(), 5)}
                  </Text>

                  <Text
                    color='brand.550'
                    size='small14400'
                  >
                    {formatSliceTokenOrUSD((remainingCollateral * collateralPrice).toString())} USDT
                  </Text>
                </Flex>
              </Flex>

              <Flex justifyContent='space-between'>
                <Text
                  color='brand.550'
                  size='small14400'
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
                    {newWorkCost} ETH
                  </Text>
                </Flex>
              </Flex>
            </Grid>
          </Grid>

          <Divider />
        </View.Condition>

        <View.Condition if={isLoading}>
          <Grid
            rowGap='24px'
            bgPosition='center'
          >
            <Loader />
          </Grid>
        </View.Condition>

        <View.Condition if={!isLoading && isSuccessful}>
          <TransactionSuccessfully
            href={`${CurrentNetworkExplorerURL[chainId || DEFAULT_CHAIN_ID]}/tx/${collateralAction === 'minus' ? txHashWithdraw : txHashBorrow}`}
          />
        </View.Condition>

        <View.Condition if={!isLoading && !isSuccessful}>
          <Button
            h='48px'
            isDisabled={isDisabled}
            onClick={onSubmit}
            variant='actionButtons'
          >
            Submit
          </Button>
        </View.Condition>
      </Flex>
    </Box>
  );
};

export { EditCollateral };
