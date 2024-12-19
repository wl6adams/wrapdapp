import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers, utils } from 'ethers';
import { formatUnits } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { Box, Button, Flex, Grid, Input, Text } from '@chakra-ui/react';

import DisconnectWallet from '@/modules/widget/disconnect-wallet/disconnect-wallet';
import {
  ACTION_SUPPLY_NATIVE_TOKEN,
  ACTION_SUPPLY_TOKEN,
  ACTION_WITHDRAW_ASSET,
} from '@/shared/consts/constant';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  cleanNumber,
  findCollateralByHealthFactor,
  formatSliceNumber,
  getBigNumber,
  getSliderColor,
  getTokenPrice,
  sortCollateralsByBalanceAndSymbol,
} from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { Each } from '@/shared/ui/each';
import { TokenCollateral } from '@/shared/ui/token-collateral';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { ConfiguratorABI } from '@/shared/web3/abi/ConfiguratorABI';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { NetworksWrappedNativeData } from '@/shared/web3/chainConfig';
import { BULKER_ADDRESS, CONFIGURATOR_ADDRESSES } from '@/shared/web3/config';
import { useApproveToken, useBorrowTokens } from '@/shared/web3/hook';
import GetMarketData from '@/shared/web3/hook/getMarketData';
import { AllCollateralData } from '@/shared/web3/types';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';

const MIN_HF = '1.5';

const LIQ_RISK = 100;

export const listOfNativeTokens = ['ETH', 'MATIC', 'MNT'];

const Collateral = ({
  openWalletConnect,
  afterTransaction,
}: {
  openWalletConnect: () => void;
  afterTransaction?: () => void;
}) => {
  const {
    liqRisk,
    setShowStep,
    collateralsData,
    selectedMarketData,
    inputValue,
    collateralsInputs,
    setLiqRisk,
    setIsLoading,
    setCollateralsInputs,
    setCollateralsData,
    setIsAfterApprove,
    setTxHash,
  } = useStore();

  const { isConnected, address, chainId } = useAccount();

  const { getTokensData, getTableData } = GetMarketData();

  const { borrowTokens, isSuccessBorrowTokens, isAbsoluteLoadingBorrowTokens, txHash } =
    useBorrowTokens();

  const [liqRiskSlider, setLiqRiskSlider] = useState<string>(MIN_HF);

  const [IsSuccessful, setIsSuccessful] = useState<boolean>(false);

  const [isBlockVisible, setIsBlockVisible] = useState<boolean>(true);

  const listRef = useRef<HTMLDivElement>(null);

  const endOfListRef = useRef<HTMLDivElement>(null);

  const { data: ConfiguratorData } = useReadContract({
    abi: ConfiguratorABI,
    address: CONFIGURATOR_ADDRESSES[selectedMarketData?.chainId || DEFAULT_CHAIN_ID],
    functionName: 'getConfiguration',
    args: selectedMarketData && [selectedMarketData.cometAddress],
    blockTag: 'latest',
  });

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: chainId || DEFAULT_CHAIN_ID,
  });

  const { approveToken, isAbsoluteLoadingApprove } = useApproveToken();

  const assetConfigs = ConfiguratorData?.assetConfigs || [];

  const isDisabledWallet = !isConnected || !address;

  const EthBalance = userEthBalance ? userEthBalance.value : BigInt(0);

  const debounceLiqRisk = useDebounce(Number(liqRiskSlider), 500);

  const totalSupplied = useMemo(() => {
    if (!collateralsInputs.collateralsInputsData || !selectedMarketData) return 0;

    const borrowCapacity =
      selectedMarketData.configuratorData
        .map(
          (collateral: AllCollateralData) =>
            Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
            Number(formatUnits(collateral.liquidateCollateralFactor, 18)) *
            getTokenPrice(selectedMarketData.asset, collateral.price, selectedMarketData.price)
        )
        .reduce((a: number, b: number) => a + b) / liqRisk;

    const borrowBalance =
      Number(formatUnits(selectedMarketData.borrowBalance, Number(selectedMarketData.decimals))) *
      selectedMarketData.price;

    return borrowCapacity - borrowBalance;
  }, [collateralsInputs, selectedMarketData, liqRisk]);

  const needSupply = useMemo(() => {
    if (!selectedMarketData || !EthBalance) return true;

    const borrowUSD = Number(inputValue) * selectedMarketData.price;

    if (totalSupplied >= borrowUSD) return false;

    const collateralsSupply = collateralsInputs.collateralsInputsData.filter(
      ({ totalSupply }) => totalSupply
    );

    if (collateralsSupply.length) {
      const needSupplyCollateralsDATA = collateralsSupply.map(({ liquidationFactor }) => {
        const liqFactor = Number(liquidationFactor) / 1e18;

        return findCollateralByHealthFactor({
          borrowUSD: borrowUSD,
          marketPrice: 1,
          healthFactor: liqRisk,
          liqFactor: liqFactor,
        });
      });

      const maxNeedSupplyAll = Math.max(...needSupplyCollateralsDATA);

      if (totalSupplied >= maxNeedSupplyAll) {
        return false;
      }
    }

    const activeInputs = collateralsInputs.collateralsInputsData.filter(
      ({ inputValue, balanceOf, symbol }) =>
        inputValue &&
        (symbol === 'ETH' || symbol == 'MATIC' ? EthBalance > BigInt(0) : balanceOf > BigInt(0))
    );

    if (activeInputs.length) {
      const collateralsNeedUSD = activeInputs.map(({ liquidationFactor }) => {
        const liqFactor = liquidationFactor ? Number(liquidationFactor) / 1e18 : 0.83;

        return findCollateralByHealthFactor({
          borrowUSD: borrowUSD,
          marketPrice: 1,
          healthFactor: liqRisk,
          liqFactor: liqFactor,
        });
      });

      const maxNeedSupply = Math.max(...collateralsNeedUSD);

      if (totalSupplied >= maxNeedSupply) {
        return false;
      }

      const addedCollateralsUSD = activeInputs
        .map(({ inputValue, price }) => Number(inputValue) * price)
        .reduce((a, b) => a + b);

      if (totalSupplied > 0) {
        return maxNeedSupply - totalSupplied >= addedCollateralsUSD;
      }

      return maxNeedSupply >= addedCollateralsUSD;
    }

    return true;
  }, [
    collateralsInputs.lastValue,
    collateralsInputs.collateralsInputsData,
    inputValue,
    selectedMarketData,
    liqRisk,
    userEthBalance,
    totalSupplied,
  ]);

  const minHF = useMemo(() => {
    if (!collateralsInputs.collateralsInputsData.length) return 1;

    const minHealthFactors = collateralsInputs.collateralsInputsData.map(
      ({ liquidationFactor, liquidateCollateralFactor }) => {
        const lF = Number(formatUnits(liquidationFactor || BigInt(93000000000000000000), 18));

        const cF = Number(
          formatUnits(liquidateCollateralFactor || BigInt(91000000000000000000), 18)
        );

        return lF / cF;
      }
    );

    return Math.max(...minHealthFactors);
  }, [collateralsInputs]);

  const isNeedApprove = useMemo(() => {
    const needToApproveAsset = collateralsInputs.collateralsInputsData.filter(
      (data) =>
        data.symbol !== 'ETH' &&
        data.symbol !== 'MATIC' &&
        Number(formatUnits(data.allowance, data.decimals)) < Number(data.inputValue)
    ).length;

    return needToApproveAsset > 0;
  }, [collateralsInputs.lastValue]);

  const isEveryCollateralInBalance = useMemo(() => {
    const lessCollateralsBalance = collateralsInputs.collateralsInputsData.filter(
      ({ symbol, inputValue, balanceOf, decimals }) =>
        symbol === 'ETH' || symbol == 'MATIC'
          ? Number(formatUnits(EthBalance, decimals)) < Number(inputValue)
          : Number(formatUnits(balanceOf, decimals)) < Number(inputValue)
    );

    return lessCollateralsBalance.length === 0;
  }, [collateralsInputs, collateralsInputs.lastValue]);

  const isDisabled = useMemo(
    () => needSupply || Number(liqRiskSlider) < 1 || !isEveryCollateralInBalance,
    [needSupply, isEveryCollateralInBalance]
  );

  const fetchCollateralData = async () => {
    if (!selectedMarketData || !assetConfigs.length || !userEthBalance) return [];
    const allCollateralsData = await getTokensData(assetConfigs, selectedMarketData?.cometAddress);

    const nativeCollateral = allCollateralsData.find(
      ({ symbol }) => NetworksWrappedNativeData[selectedMarketData.chainId] === symbol
    );

    if (nativeCollateral) {
      return [
        ...allCollateralsData,
        {
          ...nativeCollateral,
          symbol: userEthBalance.symbol,
          balanceOf: userEthBalance.value,
        },
      ];
    }

    return allCollateralsData;
  };

  const updateCollateralInputs = (sortedData: AllCollateralData[]) => {
    if (collateralsInputs.lastValue !== 0) {
      setCollateralsInputs({
        lastValue: 0,
        collateralsInputsData: sortedData.map(({ allowance, balanceOf, totalSupply }, index) => ({
          ...collateralsInputs.collateralsInputsData[index],
          balanceOf,
          allowance,
          totalSupply,
        })),
      });
    } else {
      setCollateralsInputs({
        lastValue: 0,
        collateralsInputsData: sortedData.map(
          ({
            symbol,
            asset,
            decimals,
            allowance,
            balanceOf,
            liquidateCollateralFactor,
            liquidationFactor,
            totalSupply,
            price,
          }) => ({
            symbol,
            inputValue: '',
            address: asset,
            valueInComet: 0,
            valueInMarketToken: 0,
            balanceOf,
            price: getTokenPrice(
              selectedMarketData?.asset || '',
              price,
              selectedMarketData?.price || 0
            ),
            allowance,
            decimals,
            isEnoughSupply: false,
            liquidateCollateralFactor,
            liquidationFactor,
            totalSupply,
          })
        ),
      });
    }
  };

  const getCollaterals = async () => {
    const allCollaterals = await fetchCollateralData();

    if (allCollaterals.length) {
      const sortedData = sortCollateralsByBalanceAndSymbol(allCollaterals);

      setCollateralsData(sortedData);

      updateCollateralInputs(sortedData);
    }
  };

  const approveCollateral = () => {
    if (!selectedMarketData) {
      return;
    }

    const needApproveCollaterals = collateralsInputs.collateralsInputsData.filter(
      (data) =>
        !listOfNativeTokens.includes(data.symbol) &&
        Number(formatUnits(data.allowance, data.decimals)) < Number(data.inputValue)
    );
    setIsLoading(true);
    setShowStep(4);

    needApproveCollaterals.map((data, index) => {
      approveToken(
        {
          abi: ERC20ABI,
          address: data.address,
          functionName: 'approve',
          args: [selectedMarketData.cometAddress, getBigNumber(data.inputValue, data.decimals)],
        },
        {
          onSuccess: () => {
            if (index + 1 >= needApproveCollaterals.length) {
              setTimeout(() => {
                setIsLoading(false);

                getCollaterals();

                setShowStep(3);
              }, 2000);
            }
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
            setShowStep(3);
          },
        }
      );
    });
  };

  const onLiqRiskChange = (target: string) => {
    const sanitizedValue = cleanNumber(target);

    setLiqRiskSlider(+sanitizedValue > LIQ_RISK ? '100' : formatSliceNumber(sanitizedValue, 1));
  };

  const onBlur = () => {
    if (Number(liqRiskSlider) < minHF) {
      setLiqRiskSlider(minHF.toFixed(1));
    }
  };

  const onSubmit = () => {
    if (!selectedMarketData || !address) {
      return;
    }

    if (isNeedApprove) {
      approveCollateral();
    } else {
      if (!isDisabled) {
        setIsAfterApprove(false);

        let isWETHPresent = false;
        let WETHValue = BigInt(0);

        const activeCollaterals = collateralsInputs.collateralsInputsData.filter(
          ({ inputValue }) => inputValue
        );

        const actions: `0x${string}`[] = activeCollaterals.map(({ symbol }) =>
          listOfNativeTokens.includes(symbol) ? ACTION_SUPPLY_NATIVE_TOKEN : ACTION_SUPPLY_TOKEN
        );

        const borrowData: `0x${string}`[] = activeCollaterals.map((collateralData) => {
          if (listOfNativeTokens.includes(collateralData.symbol)) {
            isWETHPresent = true;
            WETHValue = getBigNumber(collateralData.inputValue, collateralData.decimals);

            const data = [selectedMarketData.cometAddress, address, WETHValue];

            return ethers.utils.defaultAbiCoder.encode(
              ['address', 'address', 'uint'],
              data
            ) as `0x${string}`;
          } else {
            const data = [
              selectedMarketData.cometAddress,
              address,
              collateralData.address,
              getBigNumber(collateralData.inputValue, collateralData.decimals),
            ];

            return utils.defaultAbiCoder.encode(
              ['address', 'address', 'address', 'uint'],
              data
            ) as `0x${string}`;
          }
        });

        actions.push(ACTION_WITHDRAW_ASSET);

        borrowData.push(
          utils.defaultAbiCoder.encode(
            ['address', 'address', 'address', 'uint'],
            [
              selectedMarketData.cometAddress,
              address,
              selectedMarketData.baseTokenAddress, // addressFrom
              getBigNumber(inputValue, Number(selectedMarketData.decimals)),
            ]
          ) as `0x${string}`
        );

        const variable = isWETHPresent
          ? {
              abi: BulkerABI,
              address: BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedMarketData?.asset],
              functionName: 'invoke',
              args: [actions, borrowData],
              value: WETHValue,
            }
          : {
              abi: BulkerABI,
              address: BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedMarketData?.asset],
              functionName: 'invoke',
              args: [actions, borrowData],
            };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        borrowTokens(variable, {
          onSuccess: () => {
            setIsSuccessful(true);
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
            setShowStep(3);
          },
        });
      }
    }
  };

  useEffect(() => {
    setLiqRisk(Number(liqRiskSlider));
  }, [debounceLiqRisk]);

  useEffect(() => {
    if (txHash) {
      setTxHash(txHash);
    }
  }, [txHash]);

  useEffect(() => {
    getCollaterals();
  }, [assetConfigs, userEthBalance]);

  useEffect(() => {
    setIsLoading(isAbsoluteLoadingBorrowTokens);

    setIsAfterApprove(false);

    if (isAbsoluteLoadingBorrowTokens) {
      setShowStep(4);
    }
  }, [isAbsoluteLoadingBorrowTokens]);

  useEffect(() => {
    if (!isAbsoluteLoadingBorrowTokens && isSuccessBorrowTokens && IsSuccessful) {
      setIsSuccessful(false);

      getTableData();

      afterTransaction?.();
    }
  }, [
    isAbsoluteLoadingBorrowTokens,
    isSuccessBorrowTokens,
    IsSuccessful,
    isAbsoluteLoadingApprove,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsBlockVisible(false);
        } else {
          setIsBlockVisible(true);
        }
      },
      {
        root: listRef.current,

        threshold: 1.0,
      }
    );

    if (endOfListRef.current) {
      observer.observe(endOfListRef.current);
    }

    return () => {
      if (endOfListRef.current) {
        observer.unobserve(endOfListRef.current);
      }
    };
  }, []);

  return (
    <Flex
      flexDirection='column'
      position='relative'
      p='2rem 1.5rem'
      gap='1rem'
      bgSize='cover'
      bgPosition='center'
    >
      <DisconnectWallet
        moveConnectWallet={openWalletConnect}
        isDisabled={isDisabledWallet}
      />

      <Box w='100%'>
        <Divider maxW={400} />
      </Box>

      <Flex
        p='16px'
        justifyContent='space-between'
        alignItems='center'
        borderRadius='8px'
        gap='25px'
        border='1px solid'
        borderColor='brand.600'
        bg='brand.400'
      >
        <Flex
          gap='5px'
          alignItems='flex-start'
          flexDirection='column'
        >
          <Text size='medium18500120'>Health Factor</Text>

          <Text
            size='small14500120'
            color='brand.550'
          >
            Min Health Factor {Number(minHF).toFixed(1)}
          </Text>
        </Flex>

        <Flex gap='5px'>
          <Input
            p='6.5px'
            w='74px'
            h='38px'
            borderRadius='8px'
            textAlign='right'
            outline='none'
            fontSize='18px'
            lineHeight='270%'
            fontWeight='500'
            _focus={{ borderColor: getSliderColor(Number(liqRiskSlider)), boxShadow: 'none' }}
            color={getSliderColor(Number(liqRiskSlider))}
            borderColor={getSliderColor(Number(liqRiskSlider))}
            variant='outline'
            value={liqRiskSlider}
            onBlur={onBlur}
            onChange={(event) => onLiqRiskChange(event.target.value)}
          />
        </Flex>
      </Flex>

      <Text size='small40012'>Collateral</Text>

      <Grid
        ref={listRef}
        gridTemplateColumns='1fr'
        rowGap='8px'
        overflowY='auto'
        maxH='400px'
        className='overflow'
        pb='3px'
      >
        <Each
          data={collateralsData}
          render={(collateral, index) => (
            <TokenCollateral
              key={`token_${collateral.asset}_${index}`}
              data={collateral}
              index={index}
              suppliedBalanceUSD={totalSupplied}
              maxEthBalance={EthBalance}
            />
          )}
        />

        <Box
          ref={endOfListRef}
          h='1px'
        />
      </Grid>

      {isBlockVisible && (
        <Box
          position='absolute'
          left='0'
          bottom='90px'
          w='calc(100% - 11px)'
          h='94px'
          bg='brand.linearGradient.50'
        />
      )}

      <Button
        isDisabled={isDisabled}
        onClick={onSubmit}
        variant='actionButtons'
      >
        {isNeedApprove ? 'Approve Transaction' : 'Submit'}
      </Button>
    </Flex>
  );
};

export default Collateral;
