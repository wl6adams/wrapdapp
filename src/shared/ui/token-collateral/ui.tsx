'use client';

import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { Button, Flex, IconButton, Input, Text } from '@chakra-ui/react';

import { listOfNativeTokens } from '@/modules/widget/collateral/collateral';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  findCollateralByHealthFactor,
  formatSliceNumber,
  getTokenPrice,
  isValidNumericInput,
  removeCommas,
} from '@/shared/lib/utils';
import { AllCollateralData } from '@/shared/web3/types';
import { useStore } from '@/store';

interface TokenCollateralProps {
  data: AllCollateralData;

  suppliedBalanceUSD: number;

  maxEthBalance: bigint;

  index: number;
}

const PERCENT = 1.01;
const PERCENT_MIN_VALUE = 1.05;

const TokenCollateral: FC<TokenCollateralProps> = ({
  data,
  index,
  suppliedBalanceUSD,
  maxEthBalance,
}) => {
  const { collateralsInputs, setCollateralsInputs, selectedMarketData, inputValue, liqRisk } =
    useStore();

  const [value, setValue] = useState<string>('');

  const [isActiveInput, setIsActiveInput] = useState(false);

  const debounceInput = useDebounce(Number(value), 300);

  const maxBalance = useMemo(() => {
    if (!maxEthBalance) {
      return `0 ${data.symbol}`;
    }

    const balance = listOfNativeTokens.includes(data.symbol)
      ? formatUnits(maxEthBalance, 18)
      : formatUnits(data.balanceOf, data.decimals);

    return formatSliceNumber(balance, 5);
  }, [maxEthBalance, data.symbol, data.balanceOf, data.decimals]);

  const isDisable = data.balanceOf <= BigInt(0);

  const equalsToMarket = useMemo(() => {
    if (!selectedMarketData || !data) {
      return '0';
    }

    const tokenInUSD = getTokenPrice(
      selectedMarketData.asset,
      data.price,
      selectedMarketData.price
    );

    const marketInUSD = selectedMarketData?.price;

    const result = (tokenInUSD / marketInUSD).toString();

    return formatSliceNumber(result, 5);
  }, [data, selectedMarketData]);

  const needToSupply = useMemo(() => {
    if (!equalsToMarket || !inputValue || !selectedMarketData) {
      return '0';
    }

    const borrowUSD = Number(inputValue) * selectedMarketData.price;

    const collateralPrice = getTokenPrice(
      selectedMarketData.asset,
      data.price,
      selectedMarketData.price
    );

    if (suppliedBalanceUSD >= borrowUSD) {
      return '0.00000';
    }

    const suppliedInAsset = suppliedBalanceUSD / collateralPrice;

    const liqFactor = Number(data.liquidationFactor) / 1e18;

    const countInAsset = findCollateralByHealthFactor({
      borrowUSD: borrowUSD,
      marketPrice: selectedMarketData.price,
      healthFactor: liqRisk,
      liqFactor: liqFactor,
      collateralPrice: collateralPrice,
    });

    if (suppliedInAsset >= countInAsset) {
      return '0.00000';
    }

    const rightPercent = borrowUSD < 10 ? PERCENT_MIN_VALUE : PERCENT;

    if (suppliedInAsset > 0) {
      const result = ((countInAsset - suppliedInAsset) * rightPercent).toString();

      return formatSliceNumber(result, 5);
    }

    const result = (countInAsset * rightPercent).toString();

    return formatSliceNumber(result, 5);
  }, [data, selectedMarketData, inputValue, liqRisk, equalsToMarket, suppliedBalanceUSD]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeCommas(e.target.value);

    if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
      const formattedValue = formatSliceNumber(rawValue, 5);

      setValue(formattedValue);
    }
  };

  const onBlur = () => {
    if (value) {
      const formattedValue = formatSliceNumber(value, 5);

      setValue(formattedValue);
    }
  };

  const onNeededSupplyClick = (neededSupply: string) => {
    const rawValue = removeCommas(neededSupply);

    if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
      const formattedValue = formatSliceNumber(rawValue, 5);

      setValue(formattedValue);
    }
  };

  const onMax = () => setValue(formatSliceNumber(maxBalance, 5));

  useEffect(() => {
    setIsActiveInput(true);
  }, [value]);

  useEffect(() => {
    if (!selectedMarketData) return;

    const liqFactor = Number(data.liquidationFactor) / 1e18;

    const countInComet = debounceInput * Number(equalsToMarket);

    const borrowUSD = Number(inputValue) * selectedMarketData.price;

    const collateralPrice = getTokenPrice(
      selectedMarketData.asset,
      data.price,
      selectedMarketData.price
    );

    const countInAsset = findCollateralByHealthFactor({
      borrowUSD: borrowUSD,
      marketPrice: selectedMarketData.price,
      healthFactor: liqRisk,
      liqFactor: liqFactor,
      collateralPrice: collateralPrice,
    });

    if (isActiveInput) {
      const updatedCollateralsInputs = collateralsInputs.collateralsInputsData.map((item, idx) =>
        idx === index
          ? {
              ...item,
              inputValue: value,
              valueInComet: countInComet,
              isEnoughSupply: Number(value) >= countInAsset,
            }
          : item
      );

      const totalValues = updatedCollateralsInputs
        .map(({ valueInComet }) => valueInComet)
        .reduce((a, b) => a + b);

      setCollateralsInputs({
        lastValue: totalValues,
        collateralsInputsData: updatedCollateralsInputs,
      });
    }

    if (Number(debounceInput) === 0) {
      setIsActiveInput(false);
    }
  }, [liqRisk, debounceInput, data, selectedMarketData, equalsToMarket]);

  return (
    <Flex
      flexDirection='column'
      p='16px'
      bg={isDisable ? 'brand.1125' : 'brand.400'}
      border='1px solid'
      borderColor={isDisable ? 'brand.1275' : 'brand.600'}
      borderRadius='8px'
    >
      <Flex
        justifyContent='space-between'
        alignItems='center'
        p='12px 0'
        borderBottom='1px solid'
        borderColor={isDisable ? 'brand.1600' : 'brand.500'}
      >
        <Flex
          alignItems='center'
          gap='8px'
        >
          <Image
            style={{ gridArea: isDisable ? 'span 3/ 1' : 'span 2/ 1' }}
            width={24}
            height={24}
            src={`/collaterals/${data.symbol}.svg`}
            alt={data.symbol}
          />

          <Text size='small16500140'>{data.symbol}</Text>
        </Flex>

        <Text
          size='small14500120'
          color={isDisable ? 'brand.1200' : 'brand.550'}
        >
          1 {data.symbol} equals {equalsToMarket} {selectedMarketData?.asset}
        </Text>
      </Flex>

      <Flex
        justifyContent='space-between'
        alignItems='center'
        p='12px 0'
        borderBottom='1px solid'
        borderColor={isDisable ? 'brand.1600' : 'brand.500'}
      >
        <Text
          size='small16500140'
          color={isDisable ? 'brand.1200' : 'brand.550'}
        >
          Protocol Balance
        </Text>

        <Text size='small16500140'>
          {data.totalSupply || 0} {data?.symbol}
        </Text>
      </Flex>

      <Flex
        justifyContent='space-between'
        alignItems='center'
        p='12px 0'
        borderBottom='1px solid'
        borderColor={isDisable ? 'brand.1600' : 'brand.500'}
      >
        <Text
          size='small16500140'
          color={isDisable ? 'brand.1200' : 'brand.550'}
        >
          Wallet Balance
        </Text>

        <Text size='small16500140'>
          {maxBalance} {data.symbol}
        </Text>
      </Flex>

      <Flex
        justifyContent='space-between'
        alignItems='center'
        p='12px 0'
      >
        <Text
          size='small16500140'
          color={isDisable ? 'brand.1200' : 'brand.550'}
        >
          Needed Supply
        </Text>

        <Flex
          gap='5px'
          alignItems='center'
        >
          <Text size='small16500140'>
            {needToSupply} {data?.symbol}
          </Text>

          <IconButton
            w='1.5rem'
            h='1.5rem'
            bg='brand.700'
            _hover={{
              bg: 'brand.50',
            }}
            aria-label='input-needed-supply'
            onClick={() => onNeededSupplyClick(needToSupply)}
          >
            <Image
              width={12}
              height={12}
              src='/down-arrow.svg'
              alt='down-arrow'
            />
          </IconButton>
        </Flex>
      </Flex>

      <Flex flexDirection='column'>
        <Flex
          gap='8px'
          flexDirection='column'
          justifyContent='space-between'
          position='relative'
          bg={isDisable ? 'brand.1600' : 'brand.500'}
          borderRadius='8px'
          p='16px 12px'
          w='100%'
        >
          <Text
            size='small14500120'
            color={isDisable ? 'brand.1200' : 'brand.550'}
          >
            Insert amount
          </Text>

          <Flex
            w='100%'
            justifyContent='space-between'
            alignItems='center'
          >
            <Input
              border='0px'
              h='30px'
              bg='none'
              w='135px'
              _focus={{ border: 'none', boxShadow: 'none' }}
              outline='none'
              fontSize={{ base: '20px', sm: '24px' }}
              lineHeight='110%'
              fontWeight='600'
              p='0'
              placeholder='0.00000'
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              isDisabled={isDisable}
            />

            <Button
              bg={isDisable ? 'brand.1625' : 'brand.600'}
              w='64px'
              h='35px'
              variant='tableButtons'
              onClick={onMax}
            >
              Max
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { TokenCollateral };
