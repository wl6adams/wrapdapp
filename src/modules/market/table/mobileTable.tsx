import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';

import BorrowButton from '@/modules/market/borrow-button/borrow-button';
import LendButton from '@/modules/market/lend-button/lend-button';
import { formatNumber, formatSliceNumber } from '@/shared/lib/utils';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { NetworksNames } from '@/shared/web3/config';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';

const MobileTable = ({
  data,
  onLendClick,
  onBorrowClick,
}: {
  data: TableData;
  onLendClick?: () => void;
  onBorrowClick?: () => void;
}) => {
  const router = useRouter();

  const { setSelectedMarketData } = useStore();

  const onGoDetailsPage = (market: TableData) => {
    setSelectedMarketData(market);

    router.push(
      `/market/${market.asset.toLowerCase()}-${NetworksNames[market.chainId].toLowerCase()}`,
      { scroll: true }
    );
  };

  return (
    <Grid
      gridTemplateColumns='repeat(2, 1fr)'
      w='100%'
      bg='brand.400'
      p='24px 16px'
      borderRadius='8px'
      rowGap='12px'
      onClick={() => onGoDetailsPage(data)}
    >
      <Grid
        gridTemplateColumns='20px 1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Text
          size='small12400120'
          color='brand.650'
          letterSpacing='0.02em'
          gridArea='1/ span 2'
        >
          Markets
        </Text>

        <Image
          width={16}
          height={16}
          src={`/collaterals/${data.asset}.svg`}
          alt={data.asset}
        />
        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          {data.asset}
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='20px 1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Text
          size='small12400120'
          color='brand.650'
          letterSpacing='0.02em'
          gridArea='1/ span 2'
        >
          Network
        </Text>

        <Image
          width={16}
          height={16}
          src={`/markets/${NetworksNames[data.chainId].toLowerCase()}.svg`}
          alt={data.asset}
        />

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          {NetworksNames[data.chainId]}
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Flex
          gap='4px'
          alignItems='center'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Net Earn APR
          </Text>

          <InfoToolTip
            fontSize='14px'
            lineHeight='140%'
            maxW='185px'
            color='brand.300'
            borderRadius='0.25rem'
            placement='top'
            label='Current market APY + added rewards'
          />
        </Flex>

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          {data.netEarnAPY.toFixed(2)}%
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Flex
          gap='4px'
          alignItems='center'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Total Earning
          </Text>

          <InfoToolTip
            fontSize='14px'
            lineHeight='140%'
            maxW='185px'
            color='brand.300'
            borderRadius='0.25rem'
            placement='top'
            label='Amount of assets lent out and earning interest'
          />
        </Flex>

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          ${formatNumber(data.totalEarning)}
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Flex
          gap='4px'
          alignItems='center'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Net Borrow APR
          </Text>

          <InfoToolTip
            fontSize='14px'
            lineHeight='140%'
            maxW='185px'
            color='brand.300'
            borderRadius='0.25rem'
            placement='top'
            label='Current borrow APR minus added rewards'
          />
        </Flex>

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          {data.netBorrowAPY.toFixed(2)}%
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Flex
          gap='4px'
          alignItems='center'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Total Borrowed
          </Text>

          <InfoToolTip
            fontSize='14px'
            lineHeight='140%'
            maxW='185px'
            color='brand.300'
            borderRadius='0.25rem'
            placement='top'
            label='Amount of assets borrowed'
          />
        </Flex>

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          ${formatNumber(data.totalBorrowed)}
        </Text>
      </Grid>

      <Grid
        gridArea='4 / span 2'
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        pb='12px'
        gap='4px'
      >
        <Text
          size='small12400120'
          color='brand.650'
          letterSpacing='0.02em'
        >
          Utilization
        </Text>

        <Text
          size='small14500140'
          color='brand.50'
          letterSpacing='0.02em'
        >
          {formatSliceNumber(data.utility.toString(), -1)}%
        </Text>

        <Box
          borderRadius='100px'
          h='4px'
          bg='brand.100'
          w={`${data.utility}%`}
        ></Box>
      </Grid>

      <LendButton
        w='98%'
        textButton='Lend'
        marketData={data}
        onClick={onLendClick}
      />

      <BorrowButton
        marketData={data}
        ml='4px'
        w='98%'
        textButton='Borrow'
        onClick={onBorrowClick}
      />
    </Grid>
  );
};

export default MobileTable;
