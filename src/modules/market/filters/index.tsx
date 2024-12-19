'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { Button, Flex, Grid, IconButton, Show, Tooltip, useDisclosure } from '@chakra-ui/react';

import CustomSelect from '@/modules/custom-select/custom-select';
import { DirectionType } from '@/modules/market/table';
import UserPositionSwitcher from '@/modules/market/user-position-switcher/user-position-switcher';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { SortIconDown, SortIconUp } from '@/shared/chakra-ui/icons';
import { Each } from '@/shared/ui/each';
import { View } from '@/shared/ui/view';
import { NetworksNames } from '@/shared/web3/config';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import { ModalsLayout } from '@/widgets/modal';

interface Filter {
  tableData?: TableData[];

  reset: () => void;

  requestSort: (key: keyof TableData) => void;

  utilityFilter: (data: { key: keyof TableData; direction: DirectionType } | null) => void;

  setData: (data: TableData[]) => void;

  sortConfig: {
    key: keyof TableData;
    direction: 'ascending' | 'descending';
  } | null;
}

const MARKETS = [
  {
    name: 'Ethereum',
    icon: '/markets/ethereum.svg',
    activeIcon: '/markets/ethereum_active.svg',
    active: false,
  },
  {
    name: 'Optimism',
    icon: '/markets/optimism.svg',
    activeIcon: '/markets/optimism_active.svg',
    active: false,
  },
  {
    name: 'Polygon',
    icon: '/markets/polygon.svg',
    activeIcon: '/markets/polygon_active.svg',
    active: false,
  },
  {
    name: 'Arbitrum',
    icon: '/markets/arbitrum.svg',
    activeIcon: '/markets/arbitrum_active.svg',
    active: false,
  },
  {
    name: 'Base',
    icon: '/markets/base.svg',
    activeIcon: '/markets/base_active.svg',
    active: false,
  },
  {
    name: 'Scroll',
    icon: '/markets/scroll.svg',
    activeIcon: '/markets/scroll_active.svg',
    active: false,
  },
  {
    name: 'Mantle',
    icon: '/markets/mantle.svg',
    activeIcon: '/markets/mantle_active.svg',
    active: false,
  },
];

const Filter = ({ sortConfig, tableData, setData, utilityFilter, requestSort, reset }: Filter) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setIsMyWallet } = useStore();

  const { address } = useAccount();

  const [marketFilters, setMarketFilters] = useState(MARKETS);

  const [isActiveUtil, setIsActiveUtil] = useState<boolean>(false);

  const [resetSelect, setResetSelect] = useState<boolean>(false);

  const [nameHoveredIcon, setNameHoveredIcon] = useState<string>('');

  const [countOfActiveFilter, setCountOfActiveFilter] = useState<number>(0);

  const onNameHoveredIcon = (nameIcon: string) => {
    setNameHoveredIcon(nameIcon);
  };

  const onMarketSortParam = useCallback(
    (marketName: string) => {
      const state = marketFilters.map((data) =>
        data.name === marketName ? { ...data, active: !data.active } : data
      );

      const activeMarkets = state.filter((data) => data.active).map((data) => data.name);

      if (tableData) {
        const filteredTableData = activeMarkets.length
          ? tableData.filter((data) => activeMarkets.includes(NetworksNames[data.chainId]))
          : tableData;

        setData(filteredTableData);
      }
      setMarketFilters(state);
    },
    [tableData, marketFilters, setData]
  );

  const onChangeUtility = useCallback(
    (direction: DirectionType) => {
      if (!direction) {
        utilityFilter(null);

        setIsActiveUtil(false);
      } else {
        utilityFilter({ key: 'utility', direction });

        setIsActiveUtil(true);
      }
    },
    [utilityFilter]
  );

  const onClearFilter = useCallback(() => {
    reset();

    setMarketFilters(MARKETS);

    utilityFilter({ key: 'utility', direction: 'descending' });

    setIsMyWallet(false);

    setIsActiveUtil(false);

    setResetSelect(true);
  }, [reset]);

  useEffect(() => {
    if (resetSelect) {
      setResetSelect(false);
    }
  }, [resetSelect]);

  const onCloseModal = () => {
    setIsMyWallet(true);

    onClose();
  };

  const onChangeMarket = (market: string) => {
    if (market === 'mywallet' && !address) {
      onOpen();
    } else {
      setIsMyWallet(market === 'mywallet');
    }
  };

  useEffect(() => {
    const activeMarkets = marketFilters.filter((data) => data.active);

    setCountOfActiveFilter(() => (isActiveUtil ? 1 + activeMarkets.length : activeMarkets.length));
  }, [marketFilters, isActiveUtil]);

  return (
    <>
      <Flex
        alignItems='center'
        justifyContent='space-between'
        flexDirection={{ base: 'column', md: 'row' }}
        rowGap='8px'
      >
        <Grid
          w={{ base: '100%', lg: 'fit-content' }}
          gridTemplateColumns={{ base: 'repeat(7, 1fr)', sm: 'repeat(7, 40px)' }}
          justifyContent={{ base: 'center', sm: 'flex-start' }}
          columnGap='8px'
        >
          <Each
            data={marketFilters}
            render={(data, index) => (
              <Tooltip
                hasArrow
                label={data.name}
                bg='brand.1100'
                color='brand.1250'
                placement='top'
                marginBottom='2px'
              >
                <Flex
                  key={`market_${data.name}_${index}`}
                  onClick={() => onMarketSortParam(data.name)}
                  onMouseEnter={() => onNameHoveredIcon(data.name)}
                  onMouseLeave={() => onNameHoveredIcon('')}
                  cursor='pointer'
                  w={{ base: 'auto', sm: '40px' }}
                  h={{ base: '50px', sm: '40px' }}
                  borderRadius='8px'
                  alignItems='center'
                  justifyContent='center'
                  bg={data.active ? 'brand.1100' : 'brand.400'}
                  border={data.active ? '1px solid' : ''}
                  borderColor={data.active ? 'brand.600' : ''}
                >
                  <Image
                    width={24}
                    height={24}
                    src={data.active || nameHoveredIcon === data.name ? data.activeIcon : data.icon}
                    alt={data.name}
                  />
                </Flex>
              </Tooltip>
            )}
          />
        </Grid>

        <Grid
          width={{ base: '100%', lg: 'fit-content' }}
          gridTemplateColumns={{
            base: 'max-content 1fr',
            md: 'max-content max-content max-content',
          }}
          alignItems='center'
          columnGap='8px'
        >
          <Button
            bg='transparent'
            display={{ base: 'none', md: 'flex' }}
            w='100%'
            h='40px'
            variant='filterButtons'
            onClick={onClearFilter}
          >
            <View.Condition if={!!countOfActiveFilter}>
              <Flex
                justifyContent='center'
                alignItems='center'
                color='brand.400'
                w='24px'
                h='24px'
                borderRadius='50%'
                bg='brand.450'
                lineHeight='1'
              >
                {countOfActiveFilter}
              </Flex>
            </View.Condition>
            Clear All Filters
          </Button>

          <CustomSelect
            display={{ base: 'block', md: 'none' }}
            formName='Sort by Utility'
            onChangeUtility={onChangeUtility}
            requestSort={requestSort}
            reset={resetSelect}
            isSmall
            customOptions={[
              { value: 'utility', name: 'Sort by Utility' },
              { value: 'totalEarning', name: 'Total Earning' },
              { value: 'netEarnAPY', name: 'Net Earn APR' },
              { value: 'netBorrowAPY', name: 'Net Borrow APR' },
              { value: 'totalBorrowed', name: 'Total Borrowed' },
            ]}
          />

          <CustomSelect
            display={{ base: 'none', md: 'block' }}
            formName='All Markets'
            onChangeUtility={onChangeUtility}
            requestSort={requestSort}
            reset={resetSelect}
            onChangeMarket={onChangeMarket}
            customOptions={[
              { value: 'allmarkets', name: 'All Markets' },
              { value: 'mywallet', name: 'My Wallet' },
            ]}
          />

          <Flex
            bg='brand.400'
            p='8px 8px 8px 16px'
            borderRadius='8px'
            cursor='pointer'
            alignItems='center'
            gap='8px'
            textTransform='capitalize'
            display={{ base: 'none', md: 'flex' }}
            onClick={() => requestSort('utility')}
          >
            Sort by Utilization{' '}
            <Grid
              ml='5px'
              gridTemplateColumns='1fr'
              rowGap='2px'
              w='10px'
            >
              <IconButton
                aria-label='Sort by Asset'
                icon={
                  <SortIconUp
                    color={
                      sortConfig?.key === 'utility' && sortConfig.direction !== 'ascending'
                        ? '#fff'
                        : '#696C77'
                    }
                  />
                }
                variant='ghost'
              />
              <IconButton
                aria-label='Sort by Asset'
                icon={
                  <SortIconDown
                    color={
                      sortConfig?.key === 'utility' && sortConfig.direction === 'ascending'
                        ? '#fff'
                        : '#696C77'
                    }
                  />
                }
                variant='ghost'
              />
            </Grid>
          </Flex>

          {/*<CustomSelect*/}
          {/*  display={{ base: 'none', md: 'block' }}*/}
          {/*  formName="Utility"*/}
          {/*  onChangeUtility={onChangeUtility}*/}
          {/*  requestSort={requestSort}*/}
          {/*  customOptions={[*/}
          {/*    { value: 'ascending', name: 'Ascending', isUtility: true },*/}
          {/*    { value: 'descending', name: 'Descending', isUtility: true },*/}
          {/*  ]}*/}
          {/*/>*/}

          <Show breakpoint='(max-width: 48em)'>
            <UserPositionSwitcher />
          </Show>
        </Grid>
      </Flex>

      <ModalsLayout
        isHiddenClose
        isOpen={isOpen}
        onClose={onClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <WalletConnect closeModal={onCloseModal} />
      </ModalsLayout>
    </>
  );
};

export default Filter;
