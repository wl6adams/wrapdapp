'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount, useBalance } from 'wagmi';
import { Box, Flex, Grid, Show, Tab, TabList, Tabs, Text, useDisclosure } from '@chakra-ui/react';

import { BorrowModal } from '@/modules/borrow/modal/modal';
import BorrowButton from '@/modules/market/borrow-button/borrow-button';
import { API_QUERY_KEYS_CHAIN_APR, ApiPromiseType } from '@/shared/api/queryKeys';
import { formatSliceNumber } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { Preloader } from '@/shared/ui/preloader';
import { View } from '@/shared/ui/view';
import { NamesNetworks, NetworksNames } from '@/shared/web3/chainConfig';
import GetMarketData from '@/shared/web3/hook/getMarketData';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';
import { useRPCStore } from '@/store/rpc';

const TopSectionChart = dynamic(() => import('@/modules/borrow/chart/top-section-chart'), {
  ssr: false,
});

const TABS = [
  {
    name: '7d',
    active: false,
  },
  {
    name: '1m',
    active: true,
  },
];

const BorrowTopSection = () => {
  const router = useRouter();

  const pathname = usePathname();

  const [lendingCalculateTabs, setLendingCalculateTabs] = useState(TABS);

  const [averageAPR, setAverageAPR] = useState(0);

  const [chartDataQuery, setChartDataQuery] = useState<ApiPromiseType | null>(null);

  const { selectedMarketData, setSelectedMarketData, allMarketsData } = useStore();

  const currentAPR = selectedMarketData?.netBorrowAPY || 0;

  const { lastChange } = useRPCStore();

  const {
    isOpen: isBorrowModalOpen,
    onOpen: onBorrowModalOpen,
    onClose: onBorrowModalClose,
  } = useDisclosure();

  const { address } = useAccount();

  const { getTableData } = GetMarketData();

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId,
  });

  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedMarketData?.baseTokenAddress,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId,
  });

  const chainData = useMemo(() => {
    if (!selectedMarketData) {
      return;
    }

    return API_QUERY_KEYS_CHAIN_APR[selectedMarketData.chainId];
  }, [selectedMarketData]);

  const chartData = useMemo(() => {
    if (chartDataQuery) {
      const lowerCasedChartData = Object.fromEntries(
        Object.entries(chartDataQuery?.markets).map(([key, value]) => [key.toLowerCase(), value])
      );

      return {
        networkId: chartDataQuery?.networkId,
        updatedAt: chartDataQuery?.updatedAt,
        markets: lowerCasedChartData,
      };
    }

    return chartDataQuery;
  }, [chartDataQuery]);

  const isWeth = selectedMarketData?.asset === 'ETH';

  const balance = isWeth ? userEthBalance : tokenBalance;

  const activeFilter = useMemo(
    () => lendingCalculateTabs.findIndex(({ active }) => active),
    [lendingCalculateTabs]
  );

  const onChangeFilter = useCallback(
    (ind: number) => {
      const activeFilter = lendingCalculateTabs.map((tab, index) =>
        ind === index ? { ...tab, active: true } : { ...tab, active: false }
      );

      setLendingCalculateTabs(activeFilter);
    },
    [lendingCalculateTabs]
  );

  const onAverageAPR = (data: number) => setAverageAPR(data);

  useEffect(() => {
    if (!selectedMarketData) {
      const neededData = pathname.replace('/borrow/', '').split('-');

      const [currentAsset, currentNetwork] = neededData;

      (async () => {
        try {
          const response = allMarketsData.length ? allMarketsData : await getTableData();

          if (!currentAsset || !currentNetwork) {
            router.push('/market/usdt-ethereum');
          } else {
            if (response?.length) {
              const currentAssetInMarket = response.find(
                (data) =>
                  data.chainId === NamesNetworks[currentNetwork] &&
                  data.asset.toLowerCase() === currentAsset
              );

              if (currentAssetInMarket) {
                setSelectedMarketData(currentAssetInMarket);
              } else {
                router.push('/market/usdt-ethereum');
              }
            }
          }
        } catch (e) {
          console.error('errore', e);
        }
      })();
    }
  }, [pathname, selectedMarketData, lastChange]);

  useEffect(() => {
    if (chainData) {
      const fetData = async () => {
        const result = await chainData?.API();

        setChartDataQuery(result);
      };

      fetData();
    }
  }, [chainData]);

  return (
    <>
      {!allMarketsData?.length && <Preloader />}

      <Grid
        p={{
          base: '0',
          lg: '1.5rem',
        }}
        bg={{
          base: 'transparent',
          lg: 'brand.750',
        }}
        gap='1.5rem'
        borderRadius='1rem'
      >
        <Show breakpoint='(min-width: 1250px)'>
          <Flex justifyContent='space-between'>
            <Flex
              gap='8px'
              alignItems='center'
            >
              <Flex
                position='relative'
                alignItems='center'
              >
                <Image
                  width={24}
                  height={24}
                  src={`/collaterals/${selectedMarketData?.asset}.svg`}
                  alt={selectedMarketData?.asset || ''}
                />

                <Image
                  style={{
                    marginLeft: '-.375rem',
                  }}
                  width={24}
                  height={24}
                  src={`/markets/${NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID].toLowerCase()}.svg`}
                  alt={NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}
                />
              </Flex>

              <Text size='large28500150'>
                {selectedMarketData?.asset}{' '}
                {NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}
              </Text>
            </Flex>

            <View.Condition if={Boolean(selectedMarketData)}>
              <BorrowButton
                w='100px'
                h='38px'
                fontWeight='500'
                fontSize='1rem'
                bg='brand.100'
                color='brand.150'
                marketData={selectedMarketData!}
                textButton='Borrow'
                onClick={onBorrowModalOpen}
              />
            </View.Condition>
          </Flex>
        </Show>

        <Show breakpoint='(max-width: 1249px)'>
          <Flex justifyContent='space-between'>
            <Flex gap='8px'>
              <Flex position='relative'>
                <Image
                  width={24}
                  height={24}
                  src={`/collaterals/${selectedMarketData?.asset}.svg`}
                  alt={selectedMarketData?.asset || ''}
                />

                <Image
                  style={{
                    marginLeft: '-.375rem',
                  }}
                  width={24}
                  height={24}
                  src={`/markets/${NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID].toLowerCase()}_active.svg`}
                  alt={NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}
                />
              </Flex>

              <Text size='large28500150'>
                {selectedMarketData?.asset}/
                {NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}
              </Text>
            </Flex>

            <View.Condition if={Boolean(selectedMarketData)}>
              <BorrowButton
                w='100px'
                h='38px'
                fontWeight='500'
                fontSize='1rem'
                bg='brand.100'
                color='brand.150'
                marketData={selectedMarketData!}
                textButton='Borrow'
                onClick={onBorrowModalOpen}
              />
            </View.Condition>
          </Flex>
        </Show>

        <Flex
          gap='1rem'
          flexDirection={{
            base: 'column',
            laptop: 'row',
          }}
          bg={{
            base: 'brand.1100',
            laptop: 'transparent',
          }}
          borderRadius={{
            base: '0.5rem',
            laptop: '0',
          }}
          p={{
            base: '1.5rem 1rem',
            laptop: '0',
          }}
        >
          <Grid
            gap={{
              base: '1rem',
              laptop: '0.5rem',
            }}
            w={{ base: '100%', laptop: '25%' }}
          >
            <View.Condition if={Boolean(address)}>
              <Grid
                bg={{
                  base: 'transparent',
                  laptop: 'brand.1100',
                }}
                borderRadius={{
                  base: '0',
                  laptop: '8px',
                }}
                p={{
                  base: '0',
                  laptop: '1.5rem',
                }}
                gap='16px'
              >
                <Text size='medium18500120'>Your Wallet Balance</Text>

                <Show breakpoint='(min-width: 1250px)'>
                  <Box
                    w='100%'
                    h='1px'
                    bg='brand.500'
                  />
                </Show>

                <Box>
                  <Text
                    color={+(balance?.formatted || 0) > 0 ? 'brand.100' : 'brand.1050'}
                    size='medium18500120'
                  >
                    {formatSliceNumber(balance?.formatted || '', 5)} {selectedMarketData?.asset}
                  </Text>
                  <Text
                    color='brand.650'
                    size='small14500120'
                  >
                    {NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}
                  </Text>
                </Box>
              </Grid>

              <Show breakpoint='(max-width: 1250px)'>
                <Box
                  w='100%'
                  h='1px'
                  bg='brand.500'
                />
              </Show>
            </View.Condition>

            <Flex
              bg={{
                base: 'transparent',
                laptop: 'brand.1100',
              }}
              borderRadius={{
                base: '0',
                laptop: '8px',
              }}
              p={{
                base: '0',
                laptop: '1.5rem',
              }}
              flexDirection='column'
              gap='1rem'
            >
              <Flex
                gap='4px'
                alignItems='center'
              >
                <Text size='medium18500120'>Net Borrow APR</Text>

                <InfoToolTip
                  fontSize='14px'
                  lineHeight='140%'
                  maxW='185px'
                  bg='brand.400'
                  color='brand.300'
                  borderRadius='0.25rem'
                  placement='top'
                  label='Current borrow APR minus added rewards'
                />
              </Flex>

              <Show breakpoint='(min-width: 1250px)'>
                <Box
                  w='100%'
                  h='1px'
                  bg='brand.500'
                />
              </Show>

              <Grid
                gap='16px'
                gridTemplateColumns={{
                  base: 'repeat(2, 1fr)',
                  laptop: 'none',
                }}
              >
                <Grid>
                  <Flex
                    alignItems='center'
                    gap='8px'
                  >
                    <Box
                      justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
                      w='13px'
                      h='13px'
                      borderRadius='50%'
                      bg='brand.1375'
                    />

                    <Text
                      size='small14500140'
                      color='brand.1375'
                    >
                      Current
                    </Text>
                  </Flex>

                  <Text size='medium18500120'>{currentAPR.toFixed(2)}%</Text>
                </Grid>

                <Grid>
                  <Flex
                    alignItems='center'
                    gap='8px'
                  >
                    <Box
                      justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
                      w='13px'
                      h='13px'
                      borderRadius='50%'
                      bg='brand.50'
                    />

                    <Text size='small14500140'>Average</Text>
                  </Flex>

                  <Text size='medium18500120'>{averageAPR.toFixed(2)}%</Text>
                </Grid>
              </Grid>
            </Flex>
          </Grid>

          <Show breakpoint='(max-width: 1250px)'>
            <Box
              w='100%'
              h='1px'
              bg='brand.500'
            />
          </Show>

          <Grid
            gap='16px'
            w={{ base: '100%', laptop: '75%' }}
            p={{ base: '0', laptop: '1.5rem' }}
            bg='brand.1100'
            borderRadius='8px'
          >
            <Flex
              h='fit-content'
              justifyContent={{ base: 'flex-start', laptop: 'flex-end' }}
            >
              <Tabs
                defaultIndex={0}
                index={activeFilter}
                onChange={onChangeFilter}
                position='relative'
                variant='unstyled'
                m={0}
                maxW='max-content'
              >
                <TabList
                  padding='0'
                  position='relative'
                  gap='0.5rem'
                >
                  <Each
                    data={lendingCalculateTabs}
                    render={({ name }, index) => (
                      <Tab
                        color='brand.50'
                        p='0.5rem 1rem'
                        key={`tabs_${index}`}
                        zIndex={3}
                        letterSpacing='2%'
                        bg='brand.400'
                        borderRadius='100px'
                        outline={activeFilter === index ? '1px solid' : 'none'}
                        outlineColor={activeFilter === index ? 'brand.450' : 'none'}
                      >
                        <Text
                          size='large12500140'
                          letterSpacing='0.02em'
                        >
                          {name}
                        </Text>
                      </Tab>
                    )}
                  />
                </TabList>
              </Tabs>
            </Flex>
            <View.Condition if={Boolean(chartData && selectedMarketData)}>
              <TopSectionChart
                activeFilter={activeFilter}
                chartData={chartData!}
                selectedMarketData={selectedMarketData!}
                onAverageAPR={onAverageAPR}
              />
            </View.Condition>
          </Grid>
        </Flex>
      </Grid>

      <BorrowModal
        isOpen={isBorrowModalOpen}
        marketData={selectedMarketData!}
        onOpen={onBorrowModalOpen}
        onClose={onBorrowModalClose}
      />
    </>
  );
};

export default BorrowTopSection;
