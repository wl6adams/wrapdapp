'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Box, Flex } from '@chakra-ui/react';

import { getChartData } from '@/shared/api/api';
import { ChartDataINT } from '@/shared/api/types';
import { customLinePlugin } from '@/shared/lib/chart';
import { formatNumber } from '@/shared/lib/utils';
import { NumericChartData } from '@/shared/ui/numeric-chart-data';

ChartJS.register(...registerables, customLinePlugin);

interface ChartProps {
  title?: string;
}

const Chart = ({ title }: ChartProps) => {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [Earning, setEarning] = useState('0');
  const [Borrowing, setBorrowing] = useState('0');
  const [Collateral, setCollateral] = useState('0');

  const [isLessThan480] = useMediaQuery('(max-width: 480px)');
  const [isLessThan800] = useMediaQuery('(min-width: 800px)');

  const [chartData, setChartData] = useState<ChartDataINT | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const result = await getChartData();
      setChartData(result);
    })();
  }, []);

  useEffect(() => {
    if (chartData?.accountings?.length) {
      const onMouseLeave = () => {
        setEarning(chartData?.accountings[chartData.accountings.length - 1].totalSupplyUsd);

        setBorrowing(chartData?.accountings[chartData.accountings.length - 1].totalBorrowUsd);

        setCollateral(
          chartData?.accountings[chartData.accountings.length - 1].collateralBalanceUsd
        );
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
  }, [chartData?.accountings]);

  useEffect(() => {
    if (chartData?.accountings?.length) {
      setEarning(chartData?.accountings[chartData.accountings.length - 1].totalSupplyUsd);
      setBorrowing(chartData?.accountings[chartData.accountings.length - 1].totalBorrowUsd);
      setCollateral(chartData?.accountings[chartData.accountings.length - 1].collateralBalanceUsd);
    }
  }, [chartData]);

  const labels = chartData?.accountings?.map(({ timestamp }) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', options);
  });

  const bottomGradientNumber = useMemo(() => {
    switch (true) {
      case isLessThan480:
        return 120;

      case isLessThan800:
        return 300;

      default:
        return 180;
    }
  }, [isLessThan480, isLessThan800]);

  const gradient = useCallback(
    (ctx: any, chartArea: any) => {
      if (!chartArea || !ctx) return;
      const { top } = chartArea;

      const gradient = ctx.createLinearGradient(0, top, 0, bottomGradientNumber);

      gradient.addColorStop(0, 'rgba(0, 249, 255, 0.6)');
      gradient.addColorStop(1, 'rgba(0, 143, 101, 0)');

      return gradient;
    },
    [bottomGradientNumber]
  );

  const datasets = [
    {
      label: 'Earning',
      data: chartData?.accountings?.map(({ totalSupplyUsd }) => Number(totalSupplyUsd)),
      borderColor: '#00D395',
      fill: false,
      lineTension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: 'Borrowing',
      data: chartData?.accountings?.map(({ totalBorrowUsd }) => Number(totalBorrowUsd)),
      borderColor: '#7B43FC',
      fill: false,
      lineTension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: 'Collateral',
      data: chartData?.accountings?.map(({ collateralBalanceUsd }) => Number(collateralBalanceUsd)),
      backgroundColor: (ctx: any) => gradient(ctx.chart.ctx, ctx.chart.chartArea),
      fill: true,
      pointRadius: 0,
      lineTension: 0.3,
      pointHoverRadius: 0,
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
    scales: {
      x: {
        ticks: {
          fontSize: 24,
          color: '#a3a3a3',
          maxTicksLimit: 8,
          align: 'center',
        },
        border: {
          display: false,
        },
        grid: {
          color: '#2e2e2e',
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          display: false,
          color: '#a3a3a3',
          maxTicksLimit: 0,
          callback: function (value: any) {
            return formatNumber(value);
          },
        },
        border: {
          display: false,
        },
        grid: {
          color: '#2e2e2e',
          display: false,
        },
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
          label: (context: any) => {
            const index = context.dataIndex;
            const dataset1Value = context.chart.data.datasets[0].data[index];
            const dataset2Value = context.chart.data.datasets[1].data[index];
            const dataset3Value = context.chart.data.datasets[2]?.data[index];

            setEarning(dataset1Value);
            setBorrowing(dataset2Value);
            setCollateral(dataset3Value);
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
    },
    devicePixelRatio: window.devicePixelRatio || 1,
  };

  return (
    <Flex
      flexDirection='column'
      height={{ base: 'auto', lg: '450px' }}
    >
      <NumericChartData
        title={title}
        Earning={Earning}
        Borrowing={Borrowing}
        Collateral={Collateral}
      />

      <Box
        ref={fieldRef}
        height={{ base: '200px', lg: '350px' }}
      >
        <Line
          data={data}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          options={options}
        />
      </Box>
    </Flex>
  );
};

export default Chart;
