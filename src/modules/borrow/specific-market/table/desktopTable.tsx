'use client';

import { memo, useMemo } from 'react';
import { InfoToolTip } from 'src/shared/ui/info-tooltip';
import { formatUnits } from 'viem';
import { Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';

import { marketSortTotalSupply } from '@/shared/dto/market-sort-total-supply';
import { formatNumber } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { View } from '@/shared/ui/view';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';

const HEADER_TABLE: {
  title: string;
  subTitle?: string;
  sortId?: keyof TableData;
  tooltipInfo?: string;
}[] = [
  {
    title: 'Collateral Assets',
    tooltipInfo: 'To borrow you need to supply one of the below assets as collateral',
  },
  {
    title: 'Total Supply',

    subTitle: 'Max Supply',
  },
  {
    title: 'Reserves',
  },
  {
    title: 'Oracle Price',
    tooltipInfo: 'Real-time price of the base asset',
  },
  {
    title: 'Collateral Factor',
    tooltipInfo: 'Maximum amount of asset that can be borrowed against collateral',
  },
  {
    title: 'Liqudation Factor',
    tooltipInfo:
      'A threshold percentage at which Collateral will be liquidated and taken away from borrower',
  },
  {
    title: 'Liqudation Penalty',
  },
];

const DesktopTable = memo(() => {
  const { selectedMarketData } = useStore();

  const market = useMemo(() => {
    return marketSortTotalSupply(selectedMarketData);
  }, [selectedMarketData]);

  return (
    <TableContainer
      bg='#1A1821'
      p='16px 24px'
      borderRadius='8px'
      w='100%'
    >
      <Table
        size='sm'
        style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}
      >
        <Thead>
          <Tr>
            <Each
              data={HEADER_TABLE}
              render={(data, index) => (
                <Th
                  key={`${data.title}_${index}`}
                  textTransform='capitalize'
                  color='brand.50'
                  border='none'
                >
                  <Flex
                    gap='5px'
                    alignItems='center'
                    justifyContent={index !== 0 ? 'center' : 'left'}
                  >
                    <View.Condition if={!!data.title && !data.subTitle}>
                      <Text size='small12400120'> {data.title} </Text>
                    </View.Condition>

                    <View.Condition if={!!data.title && !!data.subTitle}>
                      <Text size='small12400120'>{data.title}</Text>/
                      <Text
                        as='span'
                        size='small12400120'
                        color='#959595'
                      >
                        {data.subTitle}
                      </Text>
                    </View.Condition>

                    <View.Condition if={Boolean(data.tooltipInfo)}>
                      <InfoToolTip
                        label={data.tooltipInfo!}
                        placement='top'
                      />
                    </View.Condition>
                  </Flex>
                </Th>
              )}
            />
          </Tr>
        </Thead>

        <Tbody className='tableBody'>
          {market?.configuratorData?.map((data, index) => {
            return (
              <Tr
                key={`collateral_${index}`}
                bg='brand.400'
                position='relative'
                _after={{
                  content: '""',
                  position: 'absolute',
                  h: '1px',
                  bottom: '0px',
                  left: '7px',
                  bg: 'brand.100',
                }}
              >
                <Td
                  borderLeftRadius='8px'
                  borderLeft='1px solid'
                  borderTop='1px solid'
                  borderColor='brand.600'
                >
                  <Flex
                    alignItems='center'
                    columnGap='8px'
                  >
                    <FallbackImage
                      width={24}
                      height={24}
                      src={`/collaterals/${data.symbol}.svg`}
                      alt={data.symbol}
                    />
                    <Text size='small14120500'>{data.symbol === 'WETH' ? 'ETH' : data.symbol}</Text>
                  </Flex>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Flex
                    gap='5px'
                    justifyContent='center'
                  >
                    <Text size='small14120500'>${formatNumber(data.totalSupply)}</Text>/
                    <Text
                      size='small14120500'
                      color='#959595'
                    >
                      ${data.maxTotalSupply}
                    </Text>
                  </Flex>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Text size='small14120500'>${data.reverse}</Text>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Text size='small14120500'>${data.oraclePrice}</Text>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Text size='small14120500'>
                    {(Number(formatUnits(data.borrowCollateralFactor, 18)) * 100).toFixed(0)}%
                  </Text>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Text size='small14120500'>
                    {(Number(formatUnits(data.liquidateCollateralFactor, 18)) * 100).toFixed(0)}%
                  </Text>
                </Td>

                <Td
                  borderTop='1px solid'
                  borderColor='brand.600'
                  isNumeric
                >
                  <Text size='small14120500'>
                    {(100 - Number(formatUnits(data.liquidationFactor, 18)) * 100).toFixed(2)}%
                  </Text>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
});

export { DesktopTable };
