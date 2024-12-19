'use client';

import { useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Grid } from '@chakra-ui/react';

import { AprTransactionType } from '@/shared/api/types';
import { customLinePlugin } from '@/shared/lib/chart';
import { formatNumber } from '@/shared/lib/utils';
import { TableData } from '@/shared/web3/types';

ChartJS.register(...registerables, customLinePlugin);

const DAYS = [7, 30];

const TopSectionChart = ({
  activeFilter,
  chartData,
  selectedMarketData,
  onAverageAPR,
}: {
  onAverageAPR: (data: number) => void;
  activeFilter: number;
  chartData: {
    networkId: number;
    updatedAt: Date;
    markets: Record<string, AprTransactionType[]>;
  };
  selectedMarketData: TableData;
}) => {
  const labels = useMemo(() => {
    if (chartData?.markets[selectedMarketData.cometAddress.toLowerCase()]?.length) {
      return chartData.markets[selectedMarketData.cometAddress.toLowerCase()]
        ?.slice(0, DAYS[activeFilter])
        ?.map(({ timestamp }) => {
          const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
          const date = new Date(Number(timestamp) * 1000);
          return date.toLocaleDateString('en-US', options);
        })
        .reverse();
    }

    return undefined;
  }, [chartData, selectedMarketData.cometAddress, activeFilter]);

  const datasets = useMemo(() => {
    if (chartData?.markets[selectedMarketData.cometAddress.toLowerCase()]?.length) {
      const result = chartData.markets[selectedMarketData.cometAddress.toLowerCase()]
        ?.slice(0, DAYS[activeFilter])
        ?.map(({ accounting }) => Number(accounting.netSupplyApr) * 100);

      const reverse = result.reverse();

      reverse.pop();

      reverse.push(selectedMarketData.netEarnAPY);

      return reverse;
    }
    return undefined;
  }, [chartData, selectedMarketData.cometAddress, activeFilter]);

  useEffect(() => {
    if (datasets?.length) {
      const average = datasets.reduce((a, b) => a + b);

      onAverageAPR(average / DAYS[activeFilter]);
    }
  }, [datasets, DAYS, activeFilter]);

  const data = {
    labels: labels,

    datasets: [
      {
        label: 'APR',
        data: datasets,
        borderColor: '#00D395',
        fill: false,
        lineTension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
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
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const index = context?.dataIndex;
            const dataset1Value = context.dataset.data[index];

            const aprValue = Math.floor(Number(dataset1Value) * 100) / 100;

            return `APR ${aprValue}`;
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
    <Grid maxHeight='280px'>
      <Line
        data={data}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        options={options}
      />
    </Grid>
  );
};

export default TopSectionChart;
