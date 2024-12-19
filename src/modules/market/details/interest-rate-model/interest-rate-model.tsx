import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { formatUnits, parseUnits } from 'viem';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';

import { secondsPerYear } from '@/shared/consts/constant';
import { customLinePlugin } from '@/shared/lib/chart';
import { GetRateType } from '@/shared/web3/types';
import { useStore } from '@/store';

ChartJS.register(...registerables, customLinePlugin);

const InterestRateModel = ({
  borrowInterest,
  supplyInterest,
}: {
  borrowInterest: string;
  supplyInterest: string;
}) => {
  const { selectedMarketData } = useStore();

  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [currentBorrowApr, setCurrentBorrowApr] = useState('0');
  const [currentEarnApr, setCurrentEarnApr] = useState('0');
  const [currentUtilization, setCurrentUtilization] = useState('0');

  useEffect(() => {
    if (selectedMarketData) {
      const onMouseLeave = () => {
        setCurrentBorrowApr(borrowInterest);
        setCurrentEarnApr(supplyInterest);
        setCurrentUtilization(selectedMarketData.utility.toFixed(2));
      };

      const onClickOutside = (event: MouseEvent) => {
        const field = fieldRef.current;
        if (field && !field.contains(event.target as Node)) {
          onMouseLeave();
        }
      };

      const field = fieldRef?.current;
      if (field) {
        field?.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mousedown', onClickOutside);
      }

      return () => {
        if (field) {
          field?.removeEventListener('mouseleave', onMouseLeave);
          document.removeEventListener('mousedown', onClickOutside);
        }
      };
    }
  }, [borrowInterest, selectedMarketData, supplyInterest]);

  useEffect(() => {
    if (selectedMarketData) {
      setCurrentBorrowApr(borrowInterest);
      setCurrentEarnApr(supplyInterest);
      setCurrentUtilization(selectedMarketData.utility.toFixed(2));
    }
  }, [borrowInterest, selectedMarketData, supplyInterest]);

  const chartData = useMemo(() => {
    if (!selectedMarketData) {
      return [];
    }

    return Array(101)
      .fill(null)
      .map((_, i) => i);
  }, [selectedMarketData]);

  const labels = chartData?.map((data) => {
    return `${data}%`;
  });

  const getRate = ({
    utilization,
    kink,
    perSecondInterestRateBase,
    perSecondInterestRateSlopeLow,
    perSecondInterestRateSlopeHigh,
  }: GetRateType): number => {
    let rate: number;
    if (utilization <= kink) {
      rate =
        Number(perSecondInterestRateBase) +
        Number(formatUnits(perSecondInterestRateSlopeLow * utilization, 18));
    } else {
      rate =
        Number(perSecondInterestRateBase) +
        Number(formatUnits(perSecondInterestRateSlopeLow * kink, 18)) +
        Number(formatUnits(perSecondInterestRateSlopeHigh * (utilization - kink), 18));
    }
    return rate;
  };
  const getApr = (data: GetRateType) => {
    const rate = getRate(data);
    return Number(((rate / 1e18) * secondsPerYear * 100).toFixed(2));
  };

  const datasets = [
    {
      label: 'borrow',
      data: chartData?.map((data) =>
        selectedMarketData
          ? getApr({
              utilization: parseUnits(
                (data === Math.round(Number(currentUtilization))
                  ? Number(currentUtilization)
                  : data
                ).toString(),
                16
              ),
              kink: selectedMarketData.curveMetrics.borrowKink,
              perSecondInterestRateBase:
                selectedMarketData.curveMetrics.borrowPerSecondInterestRateBase,
              perSecondInterestRateSlopeHigh:
                selectedMarketData.curveMetrics.borrowPerSecondInterestRateSlopeHigh,
              perSecondInterestRateSlopeLow:
                selectedMarketData.curveMetrics.borrowPerSecondInterestRateSlopeLow,
            })
          : 0
      ),
      borderColors: '#7B43FC',
      fill: false,
      lineTension: 0.3,
      pointColor: '#7B43FC',
      pointBackgroundColor: '#7B43FC',
      pointRadius: (preCtx: any) => {
        const ticks = preCtx.chart.data.datasets[2].data;
        return ticks.map((value: number) => {
          if (value === Number(currentUtilization)) {
            return 5;
          } else {
            return 0;
          }
        });
      },
      pointHoverBackgroundColor: '#7B43FC',
      pointBorderColor: '#ffffff',
      pointHoverRadius: 5,

      segment: {
        borderColor: (ctx: any) => {
          const xVal = ctx.p1.parsed.x;
          if (xVal > Math.round(Number(currentUtilization))) {
            return '#2b3947';
          } else {
            return '#7B43FC';
          }
        },
      },
    },
    {
      label: 'earn',
      data: chartData?.map((data) =>
        selectedMarketData
          ? getApr({
              utilization: parseUnits(
                (data === Math.round(Number(currentUtilization))
                  ? Number(currentUtilization)
                  : data
                ).toString(),
                16
              ),
              kink: selectedMarketData.curveMetrics.supplyKink,
              perSecondInterestRateBase:
                selectedMarketData.curveMetrics.supplyPerSecondInterestRateBase,
              perSecondInterestRateSlopeHigh:
                selectedMarketData.curveMetrics.supplyPerSecondInterestRateSlopeHigh,
              perSecondInterestRateSlopeLow:
                selectedMarketData.curveMetrics.supplyPerSecondInterestRateSlopeLow,
            })
          : 0
      ),
      borderColor: '#25FFBF',
      fill: false,
      lineTension: 0.3,
      pointRadius: (preCtx: any) => {
        const ticks = preCtx.chart.data.datasets[2].data;
        return ticks.map((value: number) => {
          if (value === Number(currentUtilization)) {
            return 5;
          } else {
            return 0;
          }
        });
      },
      pointColor: '#25FFBF',
      pointBackgroundColor: '#25FFBF',
      pointHoverBackgroundColor: '#25FFBF',
      pointBorderColor: '#ffffff',
      segment: {
        borderColor: (ctx: any) => {
          const xVal = ctx.p1.parsed.x;
          if (xVal > Math.round(Number(currentUtilization))) {
            return '#2b3947';
          } else {
            return '#25FFBF';
          }
        },
      },
    },

    {
      display: false,
      label: 'Collateral',
      data: chartData?.map((data) =>
        data === Math.round(Number(currentUtilization)) ? Number(currentUtilization) : data
      ),
      fill: false,
      pointRadius: 0,
      lineTension: 0.3,
      hidden: true,
    },
  ];

  const data = {
    labels: labels,

    datasets: datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 3,
    animation: false,
    hover: {
      mode: 'index',
      intersect: false,
    },
    transitions: {
      active: {
        animation: {
          duration: 0,
        },
      },
    },
    layout: {
      padding: {
        top: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          fontSize: 24,
          color: '#a3a3a3',
          callback: function (value: number) {
            if (value === 0) {
              return `${value.toFixed(2)}%`;
            }
            if (value === Number(selectedMarketData?.utility.toFixed(0))) {
              return `${selectedMarketData?.utility.toFixed(2)}%`;
            }
          },
          maxTicksLimit: 100,
        },
        border: {
          display: false,
        },
        grid: {
          hidden: true,
          color: '#1A1821',
        },
      },
      y: {
        position: 'right',
        ticks: {
          hidden: true,
          display: false,
          maxTicksLimit: 12,
        },
        border: {
          display: false,
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: false,
          color: '#2b3947',
        },
        beginAtZero: false,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: (context: any) => {
            const index = context?.dataIndex;
            const dataset1Value = context.chart.data.datasets[0].data[index];
            const dataset2Value = context?.chart?.data?.datasets[1]?.data[index];
            const dataset3Value = context.chart.data.datasets[2]?.data[index];

            setCurrentBorrowApr(dataset1Value);
            setCurrentEarnApr(dataset2Value);
            setCurrentUtilization(dataset3Value);
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
      events: [],

      verticalHoverLine: {
        defaultUtilityValue: selectedMarketData?.utility.toFixed(2),
      },
    },
  };

  return (
    <Grid
      flex='1'
      gap='0.5rem'
      gridTemplateRows='25px 1fr'
    >
      <Text size='medium18500120'>Interest Rate Model</Text>

      <Grid
        p={{
          base: '1rem 1.5rem',
          lg: '1rem 1.5rem 1rem 0.875rem',
        }}
        gap='1rem'
        bg='brand.750'
        borderRadius='8px'
      >
        <Flex gap='1rem'>
          <Box w={{ base: '100%', lg: '123px' }}>
            <Text
              size='small14500140'
              color='brand.650'
            >
              Borrow APR
            </Text>

            <Text size='medium18500120'>{currentBorrowApr}%</Text>
          </Box>

          <Box w={{ base: '100%', lg: '123px' }}>
            <Text
              size='small14500140'
              color='brand.650'
            >
              Earn APR
            </Text>

            <Text size='medium18500120'>{currentEarnApr}%</Text>
          </Box>

          <Box w={{ base: '100%', lg: '123px' }}>
            <Text
              size='small14500140'
              color='brand.650'
            >
              Utilization
            </Text>

            <Text size='medium18500120'>{currentUtilization}%</Text>
          </Box>
        </Flex>

        <Box
          ref={fieldRef}
          maxH='180px'
        >
          <Line
            data={data}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            options={options}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default InterestRateModel;
