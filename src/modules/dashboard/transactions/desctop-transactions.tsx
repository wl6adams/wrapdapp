import React from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { Button, Flex, Grid, IconButton, Skeleton, Text } from '@chakra-ui/react';

import { DirectionType } from '@/modules/market/table';
import { SortIconDown, SortIconUp } from '@/shared/chakra-ui/icons';
import { formatSliceTokenOrUSD, formattedDate, getTokenPrice } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { Cell, Row, Table, TableBody, TableHeader } from '@/shared/ui/table';
import { View } from '@/shared/ui/view';
import { CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { NetworksNames } from '@/shared/web3/config';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';
import { TransactionData } from '@/store/transaction';

const HEADER_TABLE: { title: string; sortId?: keyof TransactionData }[] = [
  {
    title: 'Time',
    sortId: 'date',
  },
  {
    title: 'Market / Network',
  },
  {
    title: 'Asset',
  },
  {
    title: 'Operation',
    sortId: 'event',
  },
  {
    title: 'Amount',
    sortId: 'value',
  },

  {
    title: '',
  },
];

export const TransactionsColors = (type: string) => {
  switch (type) {
    case 'Withdraw':
      return 'brand.1200';

    case 'Withdraw Collateral':
      return 'brand.1200';

    default:
      return 'brand.100';
  }
};

interface DesktopProps {
  requestSort: (key: keyof TransactionData, direction?: DirectionType) => void;

  sortConfig: {
    key: keyof TransactionData;
    direction: DirectionType;
  } | null;

  sortedData: TransactionData[];

  isLoaded: boolean;
}

const DesctopTransactions = ({ requestSort, sortConfig, sortedData, isLoaded }: DesktopProps) => {
  const { allMarketsData, compoundPrice } = useStore();

  return (
    <Table>
      <TableHeader>
        <Flex w='100%'>
          <Each
            data={HEADER_TABLE}
            render={(data) => (
              <Cell>
                <Skeleton
                  borderRadius='50px'
                  startColor='brand.150'
                  minH={!isLoaded ? '26px' : 'auto'}
                  isLoaded={isLoaded}
                >
                  <Grid
                    gridTemplateColumns='max-content 10px'
                    alignItems='center'
                    cursor='pointer'
                    onClick={() => requestSort(data.sortId || 'date')}
                  >
                    <Text
                      textAlign='left'
                      size='small12400120'
                      userSelect='none'
                      textTransform='capitalize'
                    >
                      {data.title}
                    </Text>

                    <View.Condition if={!!data.sortId}>
                      <Grid
                        ml='5px'
                        gridTemplateColumns='1fr'
                        rowGap='2px'
                        w='10px'
                      >
                        <IconButton
                          aria-label='Sort by Asset'
                          icon={
                            <SortIconUp
                              color={
                                sortConfig?.key === data.sortId &&
                                sortConfig?.direction !== 'ascending'
                                  ? '#fff'
                                  : '#696C77'
                              }
                            />
                          }
                          variant='ghost'
                        />

                        <IconButton
                          aria-label='Sort by Asset'
                          icon={
                            <SortIconDown
                              color={
                                sortConfig?.key === data.sortId &&
                                sortConfig?.direction === 'ascending'
                                  ? '#fff'
                                  : '#696C77'
                              }
                            />
                          }
                          variant='ghost'
                        />
                      </Grid>
                    </View.Condition>
                  </Grid>
                </Skeleton>
              </Cell>
            )}
          />
        </Flex>
      </TableHeader>

      <TableBody>
        <Grid
          w='100%'
          gap='0.5rem'
        >
          <Each
            data={sortedData || []}
            render={(transaction, index) => {
              const currentMarketData = allMarketsData.find(
                (data) => data.chainId === transaction.network && transaction.market === data.asset
              );

              const collateralData =
                currentMarketData?.configuratorData?.find(
                  ({ asset }) => asset === transaction.collateral
                ) ?? null;

              const decimals = (() => {
                if (!currentMarketData) return 18;
                if (['Lend', 'Withdraw'].includes(transaction.event)) {
                  return Number(currentMarketData.decimals);
                }
                return collateralData ? collateralData.decimals : 18;
              })();

              const price = (() => {
                if (collateralData && currentMarketData) {
                  return getTokenPrice(
                    currentMarketData.asset,
                    collateralData.price,
                    currentMarketData.price
                  );
                }

                return currentMarketData ? currentMarketData.price : compoundPrice;
              })();

              return (
                <Row
                  key={`${transaction.market}_${index}`}
                  border={!isLoaded ? 'none' : '1px solid'}
                  backgroundColor={!isLoaded ? 'brand.150' : 'brand.400'}
                >
                  <Cell>
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Text
                        fontSize='16px'
                        textAlign='left'
                        size='small14120500'
                      >
                        {formattedDate(new Date(transaction.date * 1000))}
                      </Text>
                    </Skeleton>
                  </Cell>

                  <Cell>
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Flex alignItems='center'>
                        <Flex
                          w='3rem'
                          alignItems='center'
                        >
                          <Image
                            width={24}
                            height={24}
                            src={`/collaterals/${transaction.market}.svg`}
                            alt={transaction.market}
                            style={{
                              flexShrink: 0,
                            }}
                          />

                          <Image
                            width={24}
                            height={24}
                            src={`/markets/${NetworksNames[transaction.network].toLowerCase()}.svg`}
                            alt={transaction.network.toString()}
                            style={{
                              flexShrink: 0,
                              marginLeft: '-0.5rem',
                            }}
                          />
                        </Flex>

                        <Flex
                          gap='5px'
                          alignItems='center'
                        >
                          <Text
                            fontSize='16px'
                            size='small14120500'
                          >
                            {transaction.market}
                          </Text>
                          <Text
                            fontSize='16px'
                            size='small14120500'
                          >
                            {NetworksNames[transaction.network]}
                          </Text>
                        </Flex>
                      </Flex>
                    </Skeleton>
                  </Cell>

                  <Cell>
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Flex
                        alignItems='center'
                        columnGap='8px'
                      >
                        <Image
                          width={24}
                          height={24}
                          src={`/collaterals/${collateralData ? collateralData.symbol : transaction.market}.svg`}
                          alt={transaction.market}
                        />
                        <Text
                          fontSize='16px'
                          size='small14120500'
                        >
                          {collateralData ? collateralData.symbol : transaction.market}
                        </Text>
                      </Flex>
                    </Skeleton>
                  </Cell>

                  <Cell>
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Text
                        fontSize='16px'
                        size='small14120500'
                        textAlign='left'
                        color={TransactionsColors(transaction.event)}
                        textTransform='capitalize'
                      >
                        {transaction.event}
                      </Text>
                    </Skeleton>
                  </Cell>

                  <Cell>
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Flex
                        flexDirection='column'
                        alignItems='flex-start'
                      >
                        <>
                          <Text
                            fontSize='16px'
                            size='small14120500'
                          >
                            {formatSliceTokenOrUSD(formatUnits(transaction.value, decimals), 5)}
                          </Text>

                          <Text
                            fontSize='16px'
                            size='small14120500'
                            color='brand.650'
                          >
                            $
                            {formatSliceTokenOrUSD(
                              (Number(formatUnits(transaction.value, decimals)) * price).toString()
                            )}
                          </Text>
                        </>
                      </Flex>
                    </Skeleton>
                  </Cell>

                  <Cell
                    display='flex'
                    justifyContent='flex-end'
                  >
                    <Skeleton
                      display='flex'
                      alignItems='center'
                      minH='42px'
                      borderRadius='50px'
                      startColor='brand.1650'
                      isLoaded={isLoaded}
                    >
                      <Button
                        variant='tableButtons'
                        onClick={() =>
                          window.open(
                            `${CurrentNetworkExplorerURL[Number(transaction.network) || DEFAULT_CHAIN_ID]}/tx/${transaction.hash}`,
                            '_blank'
                          )
                        }
                      >
                        Details
                      </Button>
                    </Skeleton>
                  </Cell>
                </Row>
              );
            }}
          />
        </Grid>
      </TableBody>
    </Table>
  );
};

export default DesctopTransactions;
