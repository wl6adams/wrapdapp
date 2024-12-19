import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import { ScriptableContext } from 'chart.js';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';

import {
  HeadingFilterDate,
  HeadingFilterDateType,
} from '@/modules/dashboard/heading-filters/heading-filters';
import { formatSliceTokenOrUSD } from '@/shared/lib/utils';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import getBaseAssetChartData, { STEPS } from '@/shared/web3/hook/getBaseAssetChartData';
import useBaseAssetChartStore from '@/store/base-asset-chart';
import { useDashboardStore } from '@/store/dashboard';
import { useRPCStore } from '@/store/rpc';

//TODO SORT CODE
const BaseAssetsCharts = () => {
  const positionRef = useRef<HTMLDivElement | null>(null);

  const profitRef = useRef<HTMLDivElement | null>(null);

  const [baseAssetEarned, setBaseAssetEarned] = useState('0');

  const [baseAssetEarnedUsd, setBaseAssetEarnedUsd] = useState('0');

  const [balance, setBalance] = useState('0');

  const [balanceToken, setBalanceToken] = useState('0');

  const [profit, setProfit] = useState('0');

  const { selectedPositionLending, lendingCards, filter } = useDashboardStore();

  const { chartData: newChartData } = useBaseAssetChartStore();

  const { lastChange } = useRPCStore();

  const { address } = useAccount();

  const selectedCard = lendingCards[selectedPositionLending];

  const activeFilter = useMemo(() => filter.find(({ active }) => active)?.value || 30, [filter]);

  const { getAssetBalance } = getBaseAssetChartData();

  useEffect(() => {
    if (!selectedCard) {
      return;
    }
    getAssetBalance(
      selectedCard.supplyBalance,
      selectedCard.cometAddress,
      selectedCard.baseTokenAddress,
      selectedCard.price,
      Number(selectedCard.decimals),
      selectedCard.chainId
    );
  }, [activeFilter, selectedCard, lastChange]);

  const labelsBalance = useMemo(() => {
    if (!address || !selectedCard || !selectedCard.baseTokenAddress) {
      return ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 17'];
    }
    const currentChartData = newChartData[address]?.[selectedCard.baseTokenAddress];
    if (currentChartData?.length) {
      return currentChartData.slice(-STEPS[activeFilter]).map(({ timestamp }) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', options);
      });
    }

    return ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 17'];
  }, [newChartData, selectedCard, activeFilter, address]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }
    const currentBalance = Number(
      formatUnits(BigInt(selectedCard.supplyBalance), Number(selectedCard.decimals))
    );

    const balance = (currentBalance * selectedCard.price).toString();

    setBalance(formatSliceTokenOrUSD(balance));
    setBalanceToken(
      currentBalance.toFixed(Number(selectedCard.decimals) > 6 ? 15 : Number(selectedCard.decimals))
    );
  }, [selectedCard]);

  const currentChartData = useMemo(() => {
    if (!address || !selectedCard?.baseTokenAddress) {
      return [];
    }

    return newChartData[address]?.[selectedCard.baseTokenAddress];
  }, [address, selectedCard, newChartData]);

  const datasetsBalance = useMemo(() => {
    if (currentChartData?.length) {
      return currentChartData.slice(-STEPS[activeFilter]).map(({ balance }) => balance.toFixed(15));
    }
    return ['0', '0', '0', '0'];
  }, [currentChartData, activeFilter]);

  const datasetsBalanceTokens = useMemo(() => {
    if (currentChartData?.length && selectedCard) {
      return currentChartData
        .slice(-STEPS[activeFilter])
        .map(({ balanceToken }) =>
          Number(formatUnits(balanceToken, Number(selectedCard.decimals))).toFixed(15)
        );
    }
    return ['0', '0', '0', '0'];
  }, [currentChartData, activeFilter, selectedCard]);

  useEffect(() => {
    if (datasetsBalance?.length) {
      const onMouseLeave = () => {
        const balance = formatSliceTokenOrUSD(
          datasetsBalance[datasetsBalance.length - 1].toString()
        );

        const balanceToken = formatSliceTokenOrUSD(
          datasetsBalanceTokens[datasetsBalanceTokens.length - 1].toString(),
          5
        );

        setBalance(balance);

        setBalanceToken(balanceToken);
      };

      const field = positionRef?.current;
      if (field) {
        field?.addEventListener('mouseleave', onMouseLeave);
      }

      return () => {
        if (field) {
          field?.removeEventListener('mouseleave', onMouseLeave);
        }
      };
    }
  }, [datasetsBalance]);

  const dataBalance = {
    labels: labelsBalance,
    datasets: [
      {
        label: 'Price',
        data: datasetsBalance,
        fill: true, // Fill the area under the line
        backgroundColor: 'rgba(0, 255, 179, 0.2)', // Color for the filled area
        borderColor: 'rgba(0, 255, 179, 1)', // Line color
        borderWidth: 2,
        tension: 0.4, // Controls the curve of the line
        pointRadius: 0, // Removes points on the line
        pointHoverRadius: 0,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 185);
          gradient.addColorStop(0, 'rgba(0, 249, 255, 0.6)');
          gradient.addColorStop(1, 'rgba(0, 143, 101, 0)');
          return gradient;
        },
        lineTension: 0.3,
      },
      {
        label: 'token',
        data: datasetsBalanceTokens,
        fill: false,
        display: false,
        hidden: true,
      },
    ],
  };

  const assetEarned = useMemo(() => {
    if (currentChartData?.length && selectedCard) {
      let totalEarned = BigInt(0);
      let prevBalanceTokenValue = 0;
      const result = currentChartData.slice(-STEPS[activeFilter]).map((data, index) => {
        if (index === 0)
          return {
            ...data,
            balance: 0,
          };
        const previous = currentChartData.slice(-STEPS[activeFilter])[index - 1];

        let earned =
          previous.balanceSecond > 0
            ? data.balanceSecond - previous.balanceSecond
            : data.balanceSecond - prevBalanceTokenValue;

        if (previous.balanceSecond > 0) {
          if (previous.balanceSecond === 0) {
            earned = 0;
          }
        } else {
          if (prevBalanceTokenValue === 0) {
            earned = 0;
          }
        }

        if (earned > 0) {
          const tokenEarnedInTokens = BigInt(data.balanceToken) - BigInt(previous.balanceToken);
          if (tokenEarnedInTokens > BigInt(0)) {
            totalEarned = totalEarned + tokenEarnedInTokens;
          }
        } else {
          if (previous.balance !== 0 && earned <= 0) {
            earned = previous.balanceSecond;
          }
        }

        prevBalanceTokenValue =
          earned > 0 && data.balanceSecond === 0 ? previous.balanceSecond : data.balanceSecond;
        return {
          ...data,
          balance: earned,
          balanceSecond:
            earned > 0 && data.balanceSecond === 0 ? previous.balanceSecond : data.balanceSecond,
        };
      });

      const baseAssetEarned = formatUnits(totalEarned, Number(selectedCard.decimals));

      const baseAssetEarnedUsdt = (
        Number(formatUnits(totalEarned, Number(selectedCard.decimals))) * selectedCard.price
      ).toString();

      setBaseAssetEarned(formatSliceTokenOrUSD(baseAssetEarned, 5));

      setBaseAssetEarnedUsd(formatSliceTokenOrUSD(baseAssetEarnedUsdt));
      return result;
    } else {
      return [
        { timestamp: new Date().getTime(), balance: 0, balanceSecond: 0, balanceToken: 0 },
        { timestamp: new Date().getTime(), balance: 0, balanceSecond: 0, balanceToken: 0 },
        { timestamp: new Date().getTime(), balance: 0, balanceSecond: 0, balanceToken: 0 },
        { timestamp: new Date().getTime(), balance: 0, balanceSecond: 0, balanceToken: 0 },
      ];
    }
  }, [currentChartData, activeFilter]);

  const positionBalance = useMemo(() => formatSliceTokenOrUSD(balanceToken, 5), [balanceToken]);

  const labelsProfit = useMemo(() => {
    if (assetEarned?.length) {
      return assetEarned.map(({ timestamp }) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        const currentDate = new Date(timestamp * 1000);
        return currentDate.toLocaleDateString('en-US', options);
      });
    }

    return ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 16'];
  }, [assetEarned]);

  const datasetsProfit = useMemo(() => {
    if (assetEarned.length) {
      return assetEarned.map(({ balance }) => balance.toFixed(15));
    }
    return ['0', ' 0', '0', '0'];
  }, [assetEarned]);

  useEffect(() => {
    if (datasetsProfit?.length) {
      const onMouseLeave = () => {
        const profit = formatSliceTokenOrUSD(
          datasetsProfit[datasetsProfit.length - 1].toString(),
          5
        );

        setProfit(profit);
      };

      const field = profitRef?.current;
      if (field) {
        field?.addEventListener('mouseleave', onMouseLeave);
      }

      return () => {
        if (field) {
          field?.removeEventListener('mouseleave', onMouseLeave);
        }
      };
    }
  }, [datasetsBalance]);

  useEffect(() => {
    if (datasetsProfit.length) {
      const profit = formatSliceTokenOrUSD(datasetsProfit[datasetsProfit.length - 1].toString(), 5);

      setProfit(profit);
    }
  }, [datasetsProfit]);

  const dataProfit = {
    labels: labelsProfit,
    datasets: [
      {
        label: 'Price',
        data: datasetsProfit,
        fill: true,
        borderColor: '#6a1eb9',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(106, 30, 185, 0)');
          gradient.addColorStop(1, '#6a1eb9');
          return gradient;
        },
        lineTension: 0.3,
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
            return '$' + value.toFixed(2);
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
      tooltip: {
        enabled: true,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: function (tooltipItem: any) {
            return '$' + tooltipItem.raw.toFixed();
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

  const optionBalance = {
    ...options,
    plugins: {
      tooltip: {
        enabled: true,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: (context: any) => {
            const index = context?.dataIndex;
            const dataset1Value = context.chart.data.datasets[0].data[index];
            const dataset2Value = context?.chart?.data?.datasets[1]?.data[index];

            setBalance(formatSliceTokenOrUSD(dataset1Value) || '0');
            setBalanceToken(dataset2Value || '0');

            return '';
          },
        },
      },

      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
      devicePixelRatio: window.devicePixelRatio || 1,
    },
  };

  const optionProfit = {
    ...options,
    plugins: {
      tooltip: {
        enabled: true,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: (context: any) => {
            if (context.raw) {
              const profit = formatSliceTokenOrUSD(context.raw.toString(), 5);

              setProfit(profit || '0');
            }
            return '';
          },
        },
      },

      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
      devicePixelRatio: window.devicePixelRatio || 1,
    },
  };

  return (
    <>
      <Flex
        alignItems='center'
        flexDirection='column'
        justifyContent='space-between'
        mb={{ base: '1rem', lg: '0' }}
      >
        <Flex
          w='100%'
          alignItems='center'
          gap='0.5rem'
          justifyContent='flex-start'
        >
          <Text size='small16500140'>Base Asset Earned for all time:</Text>

          <Flex
            p='4px 8px 4px 4px'
            borderRadius='28px'
            alignItems='center'
            gap='5px'
          >
            <Image
              style={{
                flexShrink: 0,
              }}
              width={20}
              height={20}
              src={`/collaterals/${selectedCard?.asset}.svg`}
              alt='ether'
            />

            <Text
              as='span'
              size='small16600110'
            >
              {baseAssetEarned}
            </Text>
          </Flex>
        </Flex>

        <Box w='100%'>
          <Text
            as='span'
            size='small12500120'
            lineHeight='1.5rem'
            color='brand.650'
          >
            ${baseAssetEarnedUsd}
          </Text>
        </Box>
      </Flex>

      <Grid
        gridTemplateColumns='1fr'
        borderBottom='1px solid'
        borderColor='brand.600'
        h='250px'
      >
        <Flex
          mb='1rem'
          alignItems='center'
          justifyContent='space-between'
        >
          <Flex
            gap='10px'
            alignItems={{ base: 'flex-start', lg: 'center' }}
          >
            <Flex
              flexDirection='column'
              gap='5px'
            >
              <Flex
                gap='5px'
                alignItems='center'
              >
                <Text size='small14500120'>Position Balance:</Text>

                <Text
                  as='span'
                  size='small14500120'
                  color='brand.100'
                >
                  {selectedCard?.asset} {positionBalance}
                </Text>

                <InfoToolTip
                  maxW='174px'
                  bg='brand.400'
                  color='brand.300'
                  borderRadius='4px'
                  label='Сurrent position balance'
                />
              </Flex>

              <Box w='100%'>
                <Text
                  as='span'
                  size='small12500120'
                  lineHeight='1.5rem'
                  color='brand.650'
                >
                  ${balance}
                </Text>
              </Box>
            </Flex>
          </Flex>

          <HeadingFilterDate type={HeadingFilterDateType.SELECT} />
        </Flex>

        <Grid ref={positionRef}>
          <Line
            data={dataBalance}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            options={optionBalance}
          />
        </Grid>
      </Grid>

      <Grid
        mt={{ base: '3.75rem', lg: '85px' }}
        gridTemplateColumns='1fr'
        borderBottom='1px solid'
        borderColor='brand.600'
        h='250px'
      >
        <Flex
          mb='1rem'
          gap='5px'
          flexDirection='column'
          alignItems='flex-start'
          justifyContent='space-between'
        >
          <Text size='small14500120'>
            Base Asset Earned:{' '}
            <Text
              as='span'
              size='small14500120'
              ml='5px'
              color='brand.1325'
            >
              {selectedCard?.asset} {formatSliceTokenOrUSD(profit.toString(), 5)}
            </Text>
          </Text>

          <Text
            as='span'
            size='small12500120'
            lineHeight='1.5rem'
            color='brand.650'
          >
            ${profit}
          </Text>
        </Flex>

        <Grid ref={profitRef}>
          <Line
            data={dataProfit}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            options={optionProfit}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default BaseAssetsCharts;
