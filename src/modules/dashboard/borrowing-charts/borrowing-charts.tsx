import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import { Each } from 'src/shared/ui/each';
import { View } from 'src/shared/ui/view';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { Flex, Grid, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import {
  HeadingFilterDate,
  HeadingFilterDateType,
} from '@/modules/dashboard/heading-filters/heading-filters';
import { API_QUERY_KEYS_CHAIN_APR } from '@/shared/api/queryKeys';
import { convertTime, formatSliceTokenOrUSD, getTokenPrice } from '@/shared/lib/utils';
import { AllCollateralData, TableData } from '@/shared/web3/types';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useDashboardStore } from '@/store/dashboard';

import { EditCollateralButton } from '../edit-collateral';

const BorrowingCharts = ({
  selectedPositionData,
  reGetData,
}: {
  selectedPositionData: TableData;
  reGetData: () => void;
}) => {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [APR, setAPR] = useState(0);

  const { selectedPosition, borrowedCards, filter } = useDashboardStore();

  const selectedCard = borrowedCards[selectedPosition];

  const chainData = API_QUERY_KEYS_CHAIN_APR[selectedCard?.chainId || DEFAULT_CHAIN_ID];

  const { address } = useAccount();

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedCard.chainId,
  });

  const activeFilter = useMemo(() => {
    return filter.find(({ active }) => active)?.value || 30;
  }, [filter]);

  const { data: chartData } = useQuery({
    queryKey: [chainData.QUERY_KEYS],
    queryFn: () => chainData.API(),
    enabled: !!chainData,
    staleTime: convertTime(12, 'hours'),
  });

  const labels = useMemo(() => {
    if (chartData && chartData.markets[selectedCard.cometAddress]?.length) {
      return chartData.markets[selectedCard.cometAddress]
        ?.slice(0, activeFilter)
        ?.map(({ timestamp }) => {
          const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
          const date = new Date(Number(timestamp) * 1000);

          return date.toLocaleDateString('en-US', options);
        })
        .reverse();
    }
    return ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20'];
  }, [chartData, selectedCard.cometAddress, activeFilter]);

  const datasets = useMemo(() => {
    if (chartData && chartData.markets[selectedCard.cometAddress]?.length) {
      const result = chartData.markets[selectedCard.cometAddress]
        ?.slice(0, activeFilter)
        ?.map(({ accounting }) => Number(accounting.netBorrowApr) * 100);

      const reverse = result.reverse();

      reverse.pop();

      reverse.push(selectedPositionData.netBorrowAPY);

      return reverse;
    }

    return [-1.017, 1.019, 0.5, 0.3, -1.017, -1.017, -1.017, -1.017];
  }, [chartData, selectedCard.cometAddress, activeFilter, selectedPositionData]);

  useEffect(() => {
    setAPR(datasets[datasets.length - 1]);
  }, [datasets]);

  useEffect(() => {
    if (datasets) {
      const onMouseLeave = () => {
        setAPR(datasets[datasets.length - 1]);
      };

      const field = fieldRef?.current;
      if (field) {
        field?.addEventListener('mouseleave', onMouseLeave);
      }

      return () => {
        if (field) {
          field?.removeEventListener('mouseleave', onMouseLeave);
        }
      };
    }
  }, [datasets]);

  const dataAPR = {
    labels: labels,
    datasets: [
      {
        label: 'Price',
        data: datasets,
        fill: false, // Fill the area under the line
        borderColor: '#33c0dd',
        borderWidth: 2,
        tension: 0.4, // Controls the curve of the line
        pointRadius: 0, // Removes points on the line
        lineTension: 0.3,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    height: '250px',
    scales: {
      x: {
        ticks: {
          color: '#a3a3a3',
          maxTicksLimit: 4,
        },
        border: {
          display: false,
        },
        grid: {
          color: '#2e2e2e',
        },
      },
      y: {
        position: 'right',
        ticks: {
          color: '#a3a3a3',
          maxTicksLimit: 3,
          callback: function (value: any) {
            return `${value.toFixed(2)}%`;
          },
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        callbacks: {
          label: (context: any) => {
            setAPR(context.raw || 0);
            return '';
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
    },
  };

  const selectedMarket = useMemo(() => {
    return borrowedCards[selectedPosition];
  }, [borrowedCards, selectedPosition]);

  const collateralPrice = useCallback(
    (price: bigint) => {
      if (!selectedMarket) {
        return 0;
      }
      return getTokenPrice(selectedMarket.asset, price, selectedMarket.price);
    },
    [selectedMarket]
  );

  const positionSummary = useMemo(() => {
    if (!borrowedCards.length || !selectedMarket) {
      return null;
    }

    const collateralValue = selectedMarket.configuratorData
      .map(
        (collateral: AllCollateralData) =>
          Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
          collateralPrice(collateral.price)
      )
      .reduce((a: number, b: number) => a + b);
    const borrowCapacity = selectedMarket.configuratorData
      .map(
        (collateral: AllCollateralData) =>
          Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
          Number(formatUnits(collateral.liquidateCollateralFactor, 18)) *
          collateralPrice(collateral.price)
      )
      .reduce((a: number, b: number) => a + b);

    const borrowBalance =
      Number(formatUnits(selectedMarket.borrowBalance, Number(selectedMarket.decimals))) *
      selectedMarket.price;

    const availableToBorrow = (borrowCapacity - borrowBalance) / selectedMarket.price;

    return {
      collateralValue: collateralValue / selectedMarket.price,
      borrowCapacity: borrowCapacity / selectedMarket.price,
      availableToBorrow: Math.max(availableToBorrow, 0),
    };
  }, [selectedMarket, borrowedCards.length]);

  return (
    <Grid
      gridTemplateColumns='1fr'
      gap='50px'
      p={{ base: '6px 6px 40px 6px', lg: '0 1.5rem 1.5rem' }}
      mt={{ base: '24px', lg: '0' }}
      borderColor='brand.600'
    >
      <Grid
        ref={fieldRef}
        gridTemplateColumns='1fr'
        borderBottom='1px solid'
        borderColor='brand.600'
        h='250px'
      >
        <Flex
          mb='16px'
          alignItems='center'
          justifyContent='space-between'
        >
          <Text size='small16500140'>APR {APR.toFixed(2)}%</Text>

          <HeadingFilterDate type={HeadingFilterDateType.SELECT} />
        </Flex>

        <Line
          data={dataAPR}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          options={options}
        />
      </Grid>

      <Grid
        display={{ base: 'none', md: 'grid' }}
        gridTemplateColumns='1fr max-content'
        gap='8px'
        pb='24px'
        borderBottom='1px solid'
        borderColor='brand.400'
        mt='75px'
      >
        <Text
          size='medium18500120'
          gridArea='1 / span 2'
        >
          Position Summary
        </Text>

        <Text
          size='medium18500120'
          color='brand.650'
          letterSpacing='0.02em'
        >
          Collateral Value
        </Text>

        <Text
          size='medium18500120'
          textAlign='right'
        >
          {formatSliceTokenOrUSD(positionSummary?.collateralValue?.toString() || '0')}{' '}
          {selectedMarket.asset}
        </Text>

        <Text
          size='medium18500120'
          color='brand.650'
          letterSpacing='0.02em'
        >
          Borrow Capacity
        </Text>

        <Text
          size='medium18500120'
          textAlign='right'
        >
          {formatSliceTokenOrUSD(positionSummary?.borrowCapacity?.toString() || '0')}{' '}
          {selectedMarket.asset}
        </Text>

        <Text
          size='medium18500120'
          color='brand.650'
          letterSpacing='0.02em'
        >
          Available to Borrow
        </Text>

        <Text
          size='medium18500120'
          textAlign='right'
        >
          {formatSliceTokenOrUSD(positionSummary?.availableToBorrow?.toString() || '0')}{' '}
          {selectedMarket.asset}
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        gap='16px'
        pb='24px'
        borderBottom='1px solid'
        borderColor='brand.400'
        mt={{ base: '40px', lg: '0' }}
      >
        <Text size='small16500140'>Current Collateral</Text>

        <View.Condition if={Boolean(selectedMarket)}>
          <Each
            data={selectedMarket.configuratorData}
            render={(data: AllCollateralData) => {
              const currentCollateralAmount = Number(
                data.symbol === 'WETH'
                  ? userEthBalance?.formatted
                  : formatUnits(data.balanceOf, data.decimals)
              ).toString();

              const currentCollateralAmountFormatted = formatSliceTokenOrUSD(
                currentCollateralAmount,
                5
              );

              const tokenSupply = Number(formatUnits(data.totalSupply, data.decimals)).toString();

              return (
                <Grid
                  key={`collateral_data_${data.asset}`}
                  gridTemplateColumns={{
                    base: '1fr max-content ',
                    md: '1fr max-content max-content',
                  }}
                  gap='8px'
                >
                  <Grid
                    gridTemplateColumns='18px max-content '
                    alignItems='center'
                    columnGap='8px'
                  >
                    <Image
                      width={18}
                      height={18}
                      src={`/collaterals/${data.symbol}.svg`}
                      alt={data.symbol}
                    />
                    <Text size='medium18500120'>
                      {data.symbol === 'WETH' ? 'ETH' : data.symbol}
                    </Text>

                    <Text
                      color='brand.550'
                      size='small14500120'
                      gridArea='2 / 2'
                    >
                      {data.symbol === 'WETH' ? 'ETH' : data.symbol} *{' '}
                      {currentCollateralAmountFormatted} in wallet
                    </Text>
                  </Grid>

                  <Grid gap='8px'>
                    <Text
                      size='medium18500120'
                      textAlign='right'
                    >
                      {formatSliceTokenOrUSD(tokenSupply, 5)}
                    </Text>

                    <Text
                      color='brand.550'
                      textAlign='right'
                      size='small14500120'
                    >
                      {(
                        Number(formatUnits(data.totalSupply, data.decimals)) *
                        collateralPrice(data.price)
                      ).toFixed(2)}{' '}
                      USD
                    </Text>
                  </Grid>

                  <EditCollateralButton
                    borrowAmountUSD={
                      Number(
                        formatUnits(
                          borrowedCards[selectedPosition].borrowBalance,
                          Number(borrowedCards[selectedPosition].decimals)
                        )
                      ) * borrowedCards[selectedPosition].price || 0
                    }
                    currentCollateralData={data}
                    reGetData={reGetData}
                  />
                </Grid>
              );
            }}
          />
        </View.Condition>
      </Grid>
    </Grid>
  );
};

export default BorrowingCharts;
