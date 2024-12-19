import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';

import BorrowButton from '@/modules/market/borrow-button/borrow-button';
import { formatNumber, formatSliceNumber } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { NetworksNames } from '@/shared/web3/config';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';

interface MobileTableProps {
  data: TableData;

  onBorrowClick: () => void;
}

const MobileTable = ({ data, onBorrowClick }: MobileTableProps) => {
  const router = useRouter();

  const { setSelectedMarketData } = useStore();

  const onGoLendPage = (market: TableData) => {
    setSelectedMarketData(market);

    router.push(
      `/borrow/${market.asset.toLowerCase()}-${NetworksNames[market.chainId].toLowerCase()}`,
      { scroll: true }
    );
  };

  return (
    <Flex
      w='100%'
      bg='brand.400'
      p='24px 16px'
      borderRadius='8px'
      flexDirection='column'
      cursor='pointer'
      role='group'
      _hover={{
        bg: 'brand.1450',
      }}
      onClick={() => onGoLendPage(data)}
    >
      <Grid
        gridTemplateColumns='repeat(2, 1fr)'
        rowGap='12px'
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
      </Grid>

      <Grid
        gridArea='4 / span 2'
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        p='12px 0'
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
          >
            Accepted Collateral
          </Text>

          <InfoToolTip
            fontSize='14px'
            lineHeight='140%'
            maxW='185px'
            color='brand.300'
            borderRadius='0.25rem'
            placement='top'
            label='Assets available to borrow against'
          />
        </Flex>

        <Flex
          justifyContent='flex-start'
          alignItems='center'
          columnGap='4px'
        >
          <Text size='small14120500'>{data.configuratorData.length}</Text>

          <Flex>
            <Each
              data={data.configuratorData}
              render={(collateral, index) => {
                const styles = index > 0 ? { marginLeft: '-.25rem' } : {};

                return (
                  <FallbackImage
                    width={16}
                    height={16}
                    src={`/collaterals/${collateral?.symbol}.svg`}
                    alt='collateral'
                    style={styles}
                  />
                );
              }}
            />
          </Flex>
        </Flex>
      </Grid>

      <Grid
        gridArea='4 / span 2'
        gridTemplateColumns='1fr'
        alignItems='center'
        borderBottom='1px solid'
        borderColor='brand.500'
        p='12px 0'
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

      <BorrowButton
        mt='12px'
        w='100%'
        textButton='Borrow'
        marketData={data}
        onClick={onBorrowClick}
      />
    </Flex>
  );
};

export { MobileTable };
