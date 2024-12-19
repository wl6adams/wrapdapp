'use client';

import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useAccount, useBalance } from 'wagmi';
import {
  Box,
  Flex,
  Grid,
  Input,
  Show,
  Tab,
  TabList,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import LendButton from '@/modules/market/lend-button/lend-button';
import { useStore as useSupplyWidgetStore } from '@/modules/supply-widget/store';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  cleanNumericString,
  formatCommaNumber,
  formatSliceNumber,
  isValidNumericInput,
  removeCommas,
} from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import GetMarketData from '@/shared/web3/hook/getMarketData';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';

const MobileChart = dynamic(() => import('@/modules/lend/chart/mobile-chart'), {
  ssr: false,
});

const LendModal = dynamic(() => import('@/modules/lend/modal/modal'), {
  ssr: false,
});

ChartJS.register(...registerables);
// ChartJS.register(annotationPlugin);

const TABS = [
  {
    name: '3m',
    value: 3,
    active: false,
  },
  {
    name: '6m',
    value: 6,
    active: false,
  },
  {
    name: '12m',
    value: 12,
    active: true,
  },
  {
    name: '24m',
    value: 24,
    active: false,
  },
];

const TABS_AMOUNT = [
  {
    id: 0.25,
    name: '25%',
    active: false,
  },
  {
    id: 0.5,
    name: '50%',
    active: false,
  },
  {
    id: 0.75,
    name: '75%',
    active: false,
  },
  {
    id: 1,
    name: 'MAX',
    active: true,
  },
];

const LendingCalculator = () => {
  const [value, setValue] = useState<string>('');

  const [lendingCalculateTabs, setLendingCalculateTabs] = useState(TABS);

  const [amountPercent, setAmountPercent] = useState(TABS_AMOUNT);

  const [chartData, setChartData] = useState<{ month: number; value: string }[]>([]);

  const { getTableData } = GetMarketData();

  const { address } = useAccount();

  const {
    isOpen: isLendModalOpen,
    onOpen: onLendModalOpen,
    onClose: onLendModalClose,
  } = useDisclosure();

  const { allMarketsData, selectedMarketData: selectedMarket } = useStore();

  const { setAmount } = useSupplyWidgetStore();

  const currentMarketsData = useMemo(() => {
    const marketChain = selectedMarket?.chainId || DEFAULT_CHAIN_ID;
    const marketAsset = selectedMarket?.asset || 'WETH';

    return allMarketsData.filter(
      (data) => data.chainId === marketChain && data.asset === marketAsset
    );
  }, [allMarketsData, selectedMarket]);

  const selectedMarketData = useMemo(() => {
    return currentMarketsData[0];
  }, [currentMarketsData]);

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId || DEFAULT_CHAIN_ID,
  });

  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedMarketData?.baseTokenAddress,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId || DEFAULT_CHAIN_ID,
  });

  const balance = selectedMarketData?.asset === 'WETH' ? userEthBalance : tokenBalance;

  const activeFilter = useMemo(
    () => lendingCalculateTabs.findIndex(({ active }) => active),
    [lendingCalculateTabs]
  );

  const activeAmountPercent = useMemo(
    () => amountPercent.findIndex(({ active }) => active),
    [amountPercent]
  );

  const debounceValue = useDebounce(Number(value), 300);

  const viewChart = useMemo(() => {
    if (!chartData.length) {
      return [];
    }

    if (activeFilter >= 0) {
      const activeFilterValue = lendingCalculateTabs[activeFilter].value;

      return chartData.filter((data) => data.month <= activeFilterValue);
    }

    return chartData.filter((data) => data.value <= value) || [];
  }, [chartData, lendingCalculateTabs, activeFilter, value]);

  const lastChartValue = useMemo(
    () => Number(viewChart[viewChart.length - 1]?.value || '0') * selectedMarketData?.price || 0,
    [selectedMarketData?.price, viewChart]
  );

  const currentValuePrice = useMemo(
    () => Number(removeCommas(value)) * (selectedMarketData?.price || 1),
    [value, selectedMarketData]
  );

  const generateChart = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 12 / 100; // Convert ARP to monthly rate
    let currentAmount = principal;
    const data = [];

    for (let month = 0; month <= months; month++) {
      data.push({ month, value: currentAmount.toFixed(2) });
      currentAmount += currentAmount * monthlyRate;
    }

    return data;
  };

  const onChangeFilter = useCallback(
    (ind: number) => {
      const activeFilter = lendingCalculateTabs.map((tab, index) =>
        ind === index ? { ...tab, active: true } : { ...tab, active: false }
      );

      setLendingCalculateTabs(activeFilter);
    },
    [lendingCalculateTabs]
  );

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeCommas(e.target.value);

    const activeFilter = amountPercent.map((tab) => ({ ...tab, active: false }));

    setAmountPercent(activeFilter);

    if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
      const input = formatSliceNumber(rawValue, Number(selectedMarketData.decimals || 18));

      setValue(input);

      setAmount(input);
    }
  };

  const onChangeAmountPercent = useCallback(
    (ind: number) => {
      if (!address) return;

      const activeAmountPercent = amountPercent.map((tab, index) =>
        ind === index ? { ...tab, active: true } : { ...tab, active: false }
      );

      setAmountPercent(activeAmountPercent);
    },
    [amountPercent, address]
  );

  const onAmountBlur = () => {
    if (value) {
      const input = cleanNumericString(value);

      const inputValue = formatCommaNumber(input, 6);

      setValue(inputValue);

      setAmount(inputValue);
    }
  };

  const onAmountFocus = () => {
    if (value) {
      const input = removeCommas(value);

      setValue(input);

      setAmount(input);
    }
  };

  const onAmountInputChange = (input: string, index?: number) => {
    const currentPercent = amountPercent[index ? index : activeAmountPercent].id;

    const multiply = Number(input) * currentPercent;

    setValue(multiply.toString());

    setAmount(multiply.toString());
  };

  useEffect(() => {
    (async () => {
      await getTableData();
    })();
  }, []);

  useEffect(() => {
    if (!balance) {
      return;
    }

    const formattedValue = formatSliceNumber(balance.formatted, 6);

    const input = removeCommas(formattedValue);

    if (activeAmountPercent >= 0) {
      onAmountInputChange(input, activeAmountPercent);

      return;
    }
  }, [activeAmountPercent, balance, amountPercent]);

  useEffect(() => {
    if (selectedMarketData) {
      const input = removeCommas(value);

      const data = generateChart(Number(input || 0), selectedMarketData.netEarnAPY, 24);

      setChartData(data);
    }
  }, [selectedMarketData, debounceValue, activeFilter, value]);

  return (
    <Grid
      gap='24px'
      borderRadius='16px'
      bg='brand.750'
      p='1.5rem'
    >
      <Flex
        alignItems={{
          base: 'flex-start',
          laptop: 'center',
        }}
        flexDirection={{
          base: 'column',
          laptop: 'row',
        }}
        gap={{
          base: '1rem',
          laptop: '0',
        }}
        justifyContent='space-between'
      >
        <Text size='medium18500120'>Lending Estimate Calculator</Text>

        <Show breakpoint='(min-width: 801px)'>
          <Tabs
            defaultIndex={0}
            index={activeFilter}
            position='relative'
            variant='unstyled'
            m={0}
            maxW='max-content'
            onChange={onChangeFilter}
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
        </Show>
      </Flex>

      <Grid
        gap='16px'
        gridTemplateColumns={{
          base: 'repeat(1, 1fr)',
          laptop: 'repeat(2, 1fr)',
        }}
      >
        <Flex
          minH='283px'
          p='24px'
          borderRadius='16px'
          bg='brand.1100'
          flexDirection='column'
          gap='16px'
        >
          <Flex justifyContent='space-between'>
            <Grid gap='8px'>
              <Text size='small16500140'>Amount</Text>

              <Input
                border='0px'
                h='30px'
                bg='none'
                _focus={{ border: 'none', boxShadow: 'none' }}
                outline='none'
                fontSize={{ base: '20px', sm: '24px' }}
                lineHeight='110%'
                fontWeight='600'
                p='0'
                placeholder='0.00'
                value={value}
                onChange={onAmountChange}
                onBlur={onAmountBlur}
                onFocus={onAmountFocus}
              />

              <Text
                color='brand.550'
                size='small14500120'
              >
                ${formatCommaNumber(currentValuePrice.toString())}
              </Text>
            </Grid>

            <Grid
              w='fit-content'
              position='relative'
              zIndex={2}
              borderRadius='50px'
              h='max-content'
              cursor='pointer'
              flexShrink='0'
            >
              <Flex
                gap='8px'
                p='4px 8px'
                zIndex={2}
                alignItems='center'
                justifyContent='space-between'
              >
                <Flex
                  gap='4px'
                  alignItems='center'
                >
                  <Image
                    width={26.4}
                    height={26.4}
                    src={`/collaterals/${selectedMarketData?.asset}.svg`}
                    alt='asset'
                  />

                  <Text size='small16500140'>{selectedMarketData?.asset}</Text>
                </Flex>
              </Flex>
            </Grid>
          </Flex>

          <Box
            w='100%'
            h='1px'
            bg='brand.500'
          />

          <Text
            opacity={address ? 1 : 0.3}
            size='small16500140'
          >
            {`Wallet balance: ${amountPercent[activeAmountPercent]?.name || '---'}`}
          </Text>

          <Flex
            zIndex={1}
            alignItems='center'
            justifyContent='space-between'
            flexDirection={{
              base: 'column',
              laptop: 'row',
            }}
            gap={{
              base: '16px',
              laptop: '0',
            }}
          >
            <Tabs
              defaultIndex={0}
              index={activeAmountPercent}
              position='relative'
              variant='unstyled'
              m={0}
              maxW='max-content'
              onChange={onChangeAmountPercent}
              opacity={address ? 1 : 0.3}
            >
              <TabList
                padding='0'
                position='relative'
                gap={{ base: '1rem 0.25rem', lg: '0.5rem' }}
                flexWrap={{
                  base: 'wrap',
                  laptop: 'nowrap',
                }}
              >
                <Each
                  data={amountPercent}
                  render={({ name }, index) => (
                    <Tab
                      key={`tabs_${index}`}
                      w='60px'
                      h='30px'
                      bg={activeAmountPercent === index ? 'brand.100' : 'brand.500'}
                      color='brand.50'
                      p='0.5rem 1rem'
                      zIndex={3}
                      letterSpacing='2%'
                      borderRadius='100px'
                      _selected={{ color: 'brand.750' }}
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

            <LendButton
              w={{
                base: '100%',
                laptop: '100px',
              }}
              h={{
                base: '40px',
                laptop: 'auto',
              }}
              bg='brand.100'
              color='brand.150'
              marketData={selectedMarketData}
              textButton='Lend'
              onClick={onLendModalOpen}
            />
          </Flex>
        </Flex>

        <Show breakpoint='(max-width: 1249px)'>
          <Box
            w='100%'
            h='1px'
            bg='brand.500'
          />
        </Show>

        <Show breakpoint='(max-width: 800px)'>
          <Tabs
            defaultIndex={0}
            index={activeFilter}
            position='relative'
            variant='unstyled'
            m={0}
            maxW='max-content'
            onChange={onChangeFilter}
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
        </Show>

        <Grid
          p='24px'
          gap='16px'
          alignItems='start'
          borderRadius='16px'
          bg='brand.1100'
        >
          <Flex
            alignItems='center'
            justifyContent='space-between'
          >
            <Text
              display='flex'
              gap='5px'
              size={{
                base: 'small14500140',
                laptop: 'large24600110',
              }}
              alignItems='center'
            >
              ${formatCommaNumber(lastChartValue?.toString() || '0')}
              <InfoToolTip
                label='Projected Base Token Total for the selected APY and time period. APYs are not fixed and vary'
                placement='right-end'
              />
            </Text>

            <Text size='small14500140'>{selectedMarketData?.netEarnAPY?.toFixed(2)}% APY</Text>
          </Flex>

          <MobileChart chartData={viewChart} />
        </Grid>

        <LendModal
          isOpen={isLendModalOpen}
          marketData={selectedMarketData}
          onClose={onLendModalClose}
        />
      </Grid>
    </Grid>
  );
};

export default LendingCalculator;
