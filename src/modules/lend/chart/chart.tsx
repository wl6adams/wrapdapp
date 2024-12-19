'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Box, Flex } from '@chakra-ui/react';

import { getChartData } from '@/shared/api/api';
import { ChartDataINT } from '@/shared/api/types';
import { customLinePlugin } from '@/shared/lib/chart';
import { formatNumber } from '@/shared/lib/utils';

import { ChartData } from './chart-data';

ChartJS.register(...registerables, customLinePlugin);

interface ChartProps {
  title?: string;
}

const Chart = ({ title }: ChartProps) => {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [Earning, setEarning] = useState('0');
  const [Collateral, setCollateral] = useState('0');

  const [chartData, setChartData] = useState<ChartDataINT | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const result = await getChartData();
      setChartData(result);
    })();
  }, []);

  const totalSupply = useMemo(() => {
    const chartData = [Earning, Collateral];

    return chartData.reduce((acc, cur) => acc + Number(cur || 0), 0);
  }, [Earning, Collateral]);

  const labels = useMemo(
    () =>
      chartData?.accountings?.map(({ timestamp }) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
    [chartData?.accountings]
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
      hidden: true,
      label: 'Collateral',
      data: chartData?.accountings?.map(({ collateralBalanceUsd }) => Number(collateralBalanceUsd)),
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0,
      lineTension: 0.3,
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
          // display: false,
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
            const dataset2Value = context.chart.data.datasets[1]?.data[index];

            setEarning(dataset1Value);
            setCollateral(dataset2Value);
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

  useEffect(() => {
    if (chartData?.accountings?.length) {
      const onMouseLeave = () => {
        setEarning(chartData?.accountings[chartData.accountings.length - 1].totalSupplyUsd);

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

      setCollateral(chartData?.accountings[chartData.accountings.length - 1].collateralBalanceUsd);
    }
  }, [chartData]);

  return (
    <Flex
      flexDirection='column'
      height={{ base: 'auto', lg: '450px' }}
    >
      <ChartData
        title={title}
        totalSupply={totalSupply}
        Earning={Earning}
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
