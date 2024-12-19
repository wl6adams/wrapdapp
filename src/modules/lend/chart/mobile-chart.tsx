'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables, ScriptableContext } from 'chart.js';
import { Grid } from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';
import { useStore } from '@/store';

ChartJS.register(...registerables);

const MobileChart = ({ chartData }: { chartData: { month: number; value: string }[] }) => {
  const { selectedMarketData } = useStore();

  const labels = useMemo(() => {
    if (chartData?.length) {
      return chartData.map((data) => `${data?.month || 0}m`);
    }

    return undefined;
  }, [chartData]);

  const datasets = useMemo(() => {
    if (chartData?.length && selectedMarketData) {
      return chartData.map((data) => Number(data?.value || 0) * (selectedMarketData?.price || 0));
    }
    return undefined;
  }, [chartData, selectedMarketData]);

  const data = {
    labels: labels,

    datasets: [
      {
        label: 'APR',
        data: datasets,
        borderColor: '#00D395',
        fill: true,
        lineTension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          if (context?.chart?.ctx) {
            const ctx = context?.chart?.ctx;
            const gradient = ctx?.createLinearGradient(0, 0, 0, 185);
            gradient?.addColorStop(0, 'rgba(0, 249, 255, 0.6)');
            gradient?.addColorStop(1, 'rgba(0, 143, 101, 0)');
            return gradient;
          }
        },
      },
    ],
  };

  const options = {
    responsive: true,
    aspectRatio: 3,
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
          color: '#324B55',
        },
      },
      y: {
        position: 'right',
        ticks: {
          color: '#a3a3a3',
          maxTicksLimit: 6,
          callback: function (value: any) {
            return formatNumber(value);
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
        enabled: false,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            return context.chart.data.datasets[0].data[index];
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
    <Grid
      gridTemplateColumns='1fr'
      borderBottom='1px solid'
      borderColor='brand.600'
      w={{
        base: 'calc(100% - 10px)',
      }}
    >
      <Line
        style={{ maxHeight: '190px' }}
        data={data}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        options={options}
      />
    </Grid>
  );
};

export default MobileChart;
