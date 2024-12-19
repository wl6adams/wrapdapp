'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Grid, Text } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';
import { useQuery } from '@tanstack/react-query';

import BaseAssetsCharts from '@/modules/dashboard/lending/base-assets-charts/base-assets-charts';
import { API_QUERY_KEYS_CHAIN_APR } from '@/shared/api/queryKeys';
import { customLinePlugin } from '@/shared/lib/chart';
import { convertTime } from '@/shared/lib/utils';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useDashboardStore } from '@/store/dashboard';

ChartJS.register(...registerables, customLinePlugin);

interface ChartsProps extends HTMLChakraProps<'div'> {}

const Charts: FC<ChartsProps> = ({ ...props }) => {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [APR, setAPR] = useState(0);

  const { selectedPositionLending, lendingCards, filter } = useDashboardStore();

  const selectedCard = lendingCards[selectedPositionLending];

  const chainData = API_QUERY_KEYS_CHAIN_APR[selectedCard?.chainId || DEFAULT_CHAIN_ID];

  const activeFilter = useMemo(() => filter.find(({ active }) => active)?.value || 30, [filter]);

  const { data: chartData } = useQuery({
    queryKey: [chainData.QUERY_KEYS],
    queryFn: () => chainData.API(),
    enabled: !!chainData,
    staleTime: convertTime(12, 'hours'),
  });

  const currentPositionAPRData = chartData?.markets[selectedCard?.cometAddress.toLowerCase()];

  const labels = useMemo(() => {
    if (currentPositionAPRData?.length) {
      return currentPositionAPRData
        ?.slice(0, activeFilter)
        ?.map(({ timestamp }) => {
          const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
          const date = new Date(Number(timestamp) * 1000);
          return date.toLocaleDateString('en-US', options);
        })
        .reverse();
    }

    return ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20'];
  }, [currentPositionAPRData, activeFilter]);

  const datasets = useMemo(() => {
    if (currentPositionAPRData?.length) {
      return currentPositionAPRData
        ?.slice(0, activeFilter)
        ?.map(({ accounting }) => Number(accounting.netSupplyApr) * 100)
        .reverse();
    }
    return [-1.017, 1.019, 0.5, 0.3, -1.017, -1.017, -1.017, -1.017];
  }, [currentPositionAPRData, activeFilter]);

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
            return '$' + tooltipItem.raw.toFixed(2);
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

  const optionAPR = {
    ...options,
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
    plugins: {
      tooltip: {
        enabled: true,
        position: 'nearest',
        intersect: false,
        mode: 'index',
        external: () => {},
        callbacks: {
          label: (context: any) => {
            setAPR(context.raw || 0);
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
  };

  return (
    <Grid
      mt='0'
      gap='0.875rem'
      borderColor='brand.600'
      gridTemplateColumns='1fr'
      p={{ base: '1.5rem 1rem', lg: '0 1.5rem 1.5rem' }}
      {...props}
    >
      <BaseAssetsCharts />

      <Grid
        ref={fieldRef}
        m='4.375rem 0 1.25rem'
        gridTemplateColumns='1fr'
        borderBottom='1px solid'
        borderColor='brand.600'
        h='250px'
      >
        <Text size='small14500120'>
          APR:{' '}
          <Text
            as='span'
            size='small14500120'
            ml='5px'
            color='brand.1300'
          >
            {APR.toFixed(2)} %
          </Text>
        </Text>

        <Line
          data={dataAPR}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          options={optionAPR}
        />
      </Grid>
    </Grid>
  );
};

export default Charts;
