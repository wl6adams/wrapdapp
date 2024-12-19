'use client';

import { formatUnits } from 'viem';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Flex, Grid, Text } from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { useStore } from '@/store';

const TokenInfo = () => {
  const [isLessThan48em] = useMediaQuery('(max-width: 48em)');

  const { selectedMarketData } = useStore();

  const tokenInfo = [
    {
      tooltipText: 'Amount of assets lent out and earning interest in this market',
      title: 'Total Earning',
      value: selectedMarketData ? `$${formatNumber(selectedMarketData.totalEarning)}` : '$32.14M',
    },
    {
      tooltipText: 'Amount of assets available to borrow or withdraw',
      title: 'Available Liquidity',
      value: selectedMarketData
        ? `$${formatNumber(
            Number(
              formatUnits(
                selectedMarketData.availableLiquidity,
                Number(selectedMarketData.decimals)
              )
            ) * selectedMarketData.price
          )}`
        : '$32.14M',
    },
    {
      tooltipText: 'Protocol reserves available to cover unexpected loses',
      title: 'Total Reserves',
      value: selectedMarketData
        ? `$${formatNumber(
            Number(
              formatUnits(selectedMarketData.totalReserves, Number(selectedMarketData.decimals))
            ) * selectedMarketData.price
          )}`
        : '$540.15K',
    },
    {
      tooltipText: 'Collateral supplied to assets borrowed in this market',
      title: 'Collateralization',
      value: selectedMarketData
        ? `${((selectedMarketData.totalEarning / selectedMarketData.totalBorrowed) * 100).toFixed(2)}%`
        : '286.87%',
    },
    {
      tooltipText: 'Real-time price of the base asset',
      title: 'Oracle Price',
      value: selectedMarketData ? `$${selectedMarketData.price.toFixed(2)}` : '$1.00',
    },
  ];
  return (
    <Grid
      gap={{ base: '0.5rem', laptop: '1rem' }}
      gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }}
    >
      <Each
        data={tokenInfo}
        render={(el, index) => (
          <Grid
            gap='8px'
            p='14.5px 16px'
            w='100%'
            gridArea={index === tokenInfo.length - 1 && isLessThan48em ? '3 / span 2' : undefined}
            h='80px'
            bg='brand.750'
            borderRadius='1rem'
          >
            <Flex
              gap='4px'
              alignItems='center'
            >
              <Text size='small14500120'>{el.title}</Text>

              <InfoToolTip
                fontSize='14px'
                lineHeight='140%'
                maxW='185px'
                bg='brand.400'
                color='brand.300'
                borderRadius='0.25rem'
                placement='top'
                label={el.tooltipText}
              />
            </Flex>

            <Text size='large24600110'>{el.value}</Text>
          </Grid>
        )}
      />
    </Grid>
  );
};

export default TokenInfo;
