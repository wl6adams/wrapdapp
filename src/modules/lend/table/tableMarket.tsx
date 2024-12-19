'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { Grid, Show, Skeleton, useDisclosure } from '@chakra-ui/react';

import Filter from '@/modules/market/filters';
import { useStore as useSupplyWidgetStore } from '@/modules/supply-widget/store';
import { sortedDataFunc, sortTable } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { Preloader } from '@/shared/ui/preloader';
import { fetchData } from '@/shared/web3/hook';
import GetMarketData from '@/shared/web3/hook/getMarketData';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import { useRPCStore } from '@/store/rpc';

import { DesktopTable } from './desktopTable';
import { MobileTable } from './mobileTable';

const LendModal = dynamic(() => import('@/modules/lend/modal/modal'), {
  ssr: false,
});

export type DirectionType = 'ascending' | 'descending';

const TableMarket = () => {
  const { isMyWallet, setIsMyWallet, isAddressData, allMarketsData, setIsAddressData } = useStore();

  const { selectedMarketData } = useSupplyWidgetStore();

  const { lastChange } = useRPCStore();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isLoaded, setIsLoaded] = useState(true);

  const { address } = useAccount();

  const [initialData, setInitialData] = useState<TableData[]>();

  const [data, setData] = useState<TableData[]>();

  const [isFirstRender, setIsFirstRender] = useState(true);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'utility', direction: 'descending' });

  const { getTableData } = GetMarketData();

  const userBaseAssetMarkets = useMemo(() => {
    return data?.filter((data) => data.baseTokenUserBalance > 0);
  }, [data]);

  const sortedData =
    data && userBaseAssetMarkets
      ? sortedDataFunc(isMyWallet ? userBaseAssetMarkets : data, sortConfig)
      : undefined;

  const requestSort = (key: keyof TableData, direction: DirectionType = 'descending') => {
    sortTable(key, direction, sortConfig, setSortConfig);
  };

  const onLendClick = () => {
    onOpen();

    if (!address) {
      return;
    }
  };

  useEffect(() => {
    if ((!isAddressData && address) || !allMarketsData.length) {
      fetchData({ setIsLoaded, setInitialData, setData, getTableData });
    } else {
      if (!allMarketsData.length) {
        setInitialData(allMarketsData);
        setData(allMarketsData);
      }
    }
    setIsFirstRender(false);
  }, [isMyWallet, isAddressData, address, allMarketsData, setInitialData]);

  useEffect(() => {
    if (!initialData?.length) {
      setInitialData(allMarketsData);
      setData(allMarketsData);
    }
  }, [initialData, allMarketsData]);

  useEffect(() => {
    if (lastChange && !isFirstRender) {
      fetchData({ setIsLoaded, setInitialData, setData, getTableData });
    }
  }, [lastChange, setInitialData]);

  useEffect(() => {
    if (!address) {
      setIsMyWallet(false);
      setIsAddressData(false);
    }
  }, [address]);

  const resetData = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <Grid
      gridTemplateColumns='1fr'
      m='40px 0'
      maxW='100%'
      overflow='hidden'
    >
      {!initialData?.length && <Preloader />}

      <Filter
        sortConfig={sortConfig}
        tableData={initialData}
        setData={(data) => {
          setData(data);
        }}
        reset={resetData}
        requestSort={requestSort}
        utilityFilter={(sortData: { key: keyof TableData; direction: DirectionType } | null) =>
          setSortConfig(sortData)
        }
      />

      <Skeleton
        minH='500px'
        height='auto'
        isLoaded={isLoaded}
        m='32px 0'
        overflowX='auto'
      >
        <Show breakpoint='(max-width: 48em)'>
          <Grid
            gridTemplateColumns='1fr'
            rowGap='10px'
          >
            <Each
              data={sortedData || []}
              render={(row, index) => (
                <MobileTable
                  key={`${row.asset}_${index}`}
                  data={row}
                  onLendClick={onLendClick}
                />
              )}
            />
          </Grid>
        </Show>

        <Show breakpoint='(min-width: 48em)'>
          <DesktopTable
            requestSort={requestSort}
            sortConfig={sortConfig}
            sortedData={sortedData}
            onLendClick={onLendClick}
          />
        </Show>
      </Skeleton>

      <LendModal
        isOpen={isOpen}
        marketData={selectedMarketData!}
        onClose={onClose}
      />
    </Grid>
  );
};

export { TableMarket };
