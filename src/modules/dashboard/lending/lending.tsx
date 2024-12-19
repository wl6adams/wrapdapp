'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { Button, Flex, Grid, Show, Text, useDisclosure } from '@chakra-ui/react';

import Charts from '@/modules/dashboard/charts/charts';
import { DesktopCard } from '@/modules/dashboard/lending/card/desktop-card';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { removeSepoliaFromTable } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { View } from '@/shared/ui/view';
import GetMarketData from '@/shared/web3/hook/getMarketData';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import { useDashboardStore } from '@/store/dashboard';
import { ModalsLayout } from '@/widgets/modal';

import { MobileCard } from './card/mobile-card';

const LendModal = dynamic(() => import('@/modules/lend/modal/modal'), {
  ssr: false,
});

const Lending = () => {
  const {
    setIsLoading,
    setLendingCards,
    lendingCards,
    reloadData,
    setReloadData,
    setSelectedPositionLending,
    selectedPositionLending,
  } = useDashboardStore();

  const { allMarketsData, isAddressData, selectedMarketData } = useStore();

  const { address } = useAccount();

  const { getTableData } = GetMarketData();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isLendModalOpen,
    onOpen: onLendModalOpen,
    onClose: onLendModalClose,
  } = useDisclosure();

  const [isPresentResponse, setIsPresentResponse] = useState<boolean>(false);

  const filterOnlyLentData = useCallback(
    (lendingData: any) => {
      const dataWithSupply = lendingData.filter(
        (data: TableData) =>
          Number(data.supplyBalance) * data.price > parseUnits('0.01', Number(data.decimals))
      );

      setLendingCards(dataWithSupply);
      setReloadData(false);
    },
    [setLendingCards, setReloadData]
  );

  const onLendClick = useCallback(() => {
    if (!address) {
      onOpen();
    }
  }, [address, onOpen]);

  const onSelectedPositionLending = useCallback(
    (index: number) => {
      setSelectedPositionLending(index);
    },
    [setSelectedPositionLending]
  );

  useEffect(() => {
    if (!address) {
      setLendingCards([]);

      return;
    }

    const fetchData = async () => {
      const allPositions =
        allMarketsData.length && !reloadData && isAddressData
          ? allMarketsData
          : await getTableData();

      if (allPositions?.length) {
        setIsPresentResponse(true);

        filterOnlyLentData(removeSepoliaFromTable(allPositions));
      } else {
        setLendingCards([]);
      }
    };

    fetchData();
  }, [address, reloadData, allMarketsData, isAddressData]);

  useEffect(() => {
    if (isPresentResponse) {
      setIsLoading(true);
    }
  }, [isPresentResponse, setIsLoading]);

  return (
    <>
      <Grid
        gridTemplateColumns='1fr'
        bg={!lendingCards.length ? 'brand.1100' : { base: 'transparent', md: 'brand.1100' }}
        border='1px solid'
        borderColor={!lendingCards.length ? 'brand.500' : { base: 'transparent', md: 'brand.500' }}
        borderRadius='16px'
        p={!lendingCards.length ? '24px' : { base: '6px', md: '24px' }}
        justifyItems={!lendingCards.length ? 'center' : 'normal'}
      >
        <View.Condition if={!Boolean(lendingCards.length)}>
          <Flex
            w='100%'
            alignItems='center'
            justifyContent='space-between'
            flexDirection={{ base: 'column', lg: 'row' }}
            p={{ base: '0', lg: '0 50px' }}
          >
            <Text
              m='24px 0'
              size='2440027'
            >
              {!address
                ? 'Connect wallet to proceed'
                : !lendingCards.length && "You don't have active positions yet"}
            </Text>

            <View.Condition if={!address}>
              <Button
                w='140px'
                h='43px'
                color='brand.750'
                onClick={onLendClick}
              >
                Connect wallet
              </Button>
            </View.Condition>

            <View.Condition if={Boolean(address && !lendingCards.length)}>
              <Link href='/lend'>
                <Button
                  w='140px'
                  h='43px'
                  color='brand.750'
                >
                  Lend
                </Button>
              </Link>
            </View.Condition>
          </Flex>

          <ModalsLayout
            isHiddenClose
            isOpen={isOpen}
            onClose={onClose}
            bgWhite='brand.150'
            bgBlack='brand.750'
          >
            <WalletConnect closeModal={onClose} />
          </ModalsLayout>
        </View.Condition>

        <View.Condition if={Boolean(lendingCards.length)}>
          <Text mb='16px'>Lending</Text>

          <Grid
            gap={{ base: '1rem', lg: 'initial' }}
            gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            alignItems='flex-start'
          >
            <Show breakpoint='(min-width: 62em)'>
              <Grid
                gridTemplateColumns='1fr'
                gap='16px'
                borderRadius='8px'
                p={{ base: '16px', md: '24px' }}
                bg='brand.750'
              >
                <Show breakpoint='(min-width: 62em)'>
                  <Text size='small16500140'>Your Positions</Text>
                </Show>

                <Each
                  data={lendingCards}
                  render={(data, index) => (
                    <DesktopCard
                      data={data}
                      index={index}
                      selectedPositionLending={selectedPositionLending}
                      onSelectedPositionLending={() => onSelectedPositionLending(index)}
                      onLendClick={onLendModalOpen}
                    />
                  )}
                />
              </Grid>
            </Show>

            <Show breakpoint='(max-width: 61.95em)'>
              <Each
                data={lendingCards}
                render={(data, index) => (
                  <MobileCard
                    data={data}
                    index={index}
                    selectedPositionLending={selectedPositionLending}
                    onSelectedPositionLending={() => onSelectedPositionLending(index)}
                    onLendClick={onLendModalOpen}
                  />
                )}
              />
            </Show>

            <Show breakpoint='(min-width: 62em)'>
              <Charts />
            </Show>
          </Grid>
        </View.Condition>

        <LendModal
          isOpen={isLendModalOpen}
          marketData={selectedMarketData!}
          onClose={onLendModalClose}
        />
      </Grid>
    </>
  );
};

export default Lending;
