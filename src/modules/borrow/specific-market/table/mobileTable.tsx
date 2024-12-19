'use client';

import React, { useMemo } from 'react';
import { formatUnits } from 'viem';
import { Flex, Grid, Text } from '@chakra-ui/react';

import { marketSortTotalSupply } from '@/shared/dto/market-sort-total-supply';
import { formatNumber } from '@/shared/lib/utils';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { useStore } from '@/store';

const MobileTable = () => {
  const { selectedMarketData } = useStore();

  const market = useMemo(() => {
    return marketSortTotalSupply(selectedMarketData);
  }, [selectedMarketData]);

  return (
    <>
      {market?.configuratorData?.map((data, index) => {
        return (
          <Flex
            key={`mobile_table_${index}`}
            w='100%'
            bg='brand.1100'
            p='24px 16px'
            borderRadius='8px'
            flexDirection='column'
          >
            <Grid
              gridTemplateColumns='repeat(2, 1fr)'
              rowGap='12px'
            >
              <Grid
                gridTemplateColumns='1fr'
                alignItems='center'
                borderBottom='1px solid'
                borderColor='brand.500'
                pb='12px'
                gap='4px'
              >
                <Flex
                  gap='5px'
                  alignItems='center'
                >
                  <Text
                    size='small12400120'
                    color='brand.650'
                    letterSpacing='0.02em'
                    gridArea='1/ span 2'
                  >
                    Collateral Assets
                  </Text>

                  <InfoToolTip
                    label='To borrow you need to supply one of the below assets as collateral'
                    placement='top'
                  />
                </Flex>

                <Flex
                  gap='5px'
                  alignItems='center'
                >
                  <FallbackImage
                    width={16}
                    height={16}
                    src={`/collaterals/${data.symbol}.svg`}
                    alt={data.symbol}
                  />

                  <Text
                    size='small14500140'
                    color='brand.50'
                    letterSpacing='0.02em'
                  >
                    {data.symbol === 'WETH' ? 'ETH' : data.symbol}
                  </Text>
                </Flex>
              </Grid>

              <Grid
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
                  Total Supply / Max Total Supply
                </Text>

                <Flex>
                  <Text
                    size='small14500140'
                    color='brand.50'
                    letterSpacing='0.02em'
                  >
                    ${formatNumber(data.totalSupply)} /
                  </Text>
                  <Text
                    size='small14500140'
                    color='#959595'
                    letterSpacing='0.02em'
                  >
                    ${data.maxTotalSupply}
                  </Text>
                </Flex>
              </Grid>

              <Grid
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
                  Reserves
                </Text>

                <Text
                  size='small14500140'
                  color='brand.50'
                  letterSpacing='0.02em'
                >
                  ${data.reverse}
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
                  gap='5px'
                  alignItems='center'
                >
                  <Text
                    size='small12400120'
                    color='brand.650'
                    letterSpacing='0.02em'
                  >
                    Oracle Price
                  </Text>

                  <InfoToolTip
                    label='Real-time price of the base asset'
                    placement='top'
                  />
                </Flex>

                <Text
                  size='small14500140'
                  color='brand.50'
                  letterSpacing='0.02em'
                >
                  ${data.oraclePrice}
                </Text>
              </Grid>

              <Grid
                alignItems='center'
                borderBottom='1px solid'
                borderColor='brand.500'
                pb='12px'
                gap='4px'
              >
                <Flex
                  gap='5px'
                  alignItems='center'
                >
                  <Text
                    size='small12400120'
                    color='brand.650'
                    letterSpacing='0.02em'
                    gridArea='1/ span 2'
                  >
                    Collateral Factor
                  </Text>

                  <InfoToolTip
                    label='Maximum amount of asset that can be borrowed against collateral'
                    placement='top'
                  />
                </Flex>

                <Text
                  size='small14500140'
                  color='brand.50'
                  letterSpacing='0.02em'
                >
                  {(Number(formatUnits(data.borrowCollateralFactor, 18)) * 100).toFixed(0)}%
                </Text>
              </Grid>

              <Grid
                alignItems='center'
                borderBottom='1px solid'
                borderColor='brand.500'
                pb='12px'
                gap='4px'
              >
                <Flex
                  gap='5px'
                  alignItems='center'
                >
                  <Text
                    size='small12400120'
                    color='brand.650'
                    letterSpacing='0.02em'
                    gridArea='1/ span 2'
                  >
                    Liquidation Factor
                  </Text>

                  <InfoToolTip
                    label='A threshold percentage at which Collateral will be liquidated and taken away from borrower'
                    placement='top'
                  />
                </Flex>

                <Text
                  size='small14500140'
                  color='brand.50'
                  letterSpacing='0.02em'
                >
                  {(Number(formatUnits(data.liquidateCollateralFactor, 18)) * 100).toFixed(0)}%
                </Text>
              </Grid>
            </Grid>

            <Grid
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
                gridArea='1/ span 2'
              >
                Liqudation Penalty
              </Text>

              <Text
                size='small14500140'
                color='brand.50'
                letterSpacing='0.02em'
              >
                {Number(formatUnits(data.liquidateCollateralFactor, 18)).toFixed(2)}%
              </Text>
            </Grid>
          </Flex>
        );
      })}
    </>
  );
};

export { MobileTable };
