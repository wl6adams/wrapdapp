import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Button, Collapse, Flex, Grid, Show, Text, useDisclosure } from '@chakra-ui/react';

import { PositionCard } from '@/modules/dashboard/borrowing/position-card/position-card';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { removeSepoliaFromTable } from '@/shared/lib/utils';
import { View } from '@/shared/ui/view';
import GetMarketData, { priceFeedMantissa } from '@/shared/web3/hook/getMarketData';
import { AllCollateralData, TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import { useDashboardStore } from '@/store/dashboard';
import { ModalsLayout } from '@/widgets/modal';

const BorrowingCharts = dynamic(
  () => import('@/modules/dashboard/borrowing-charts/borrowing-charts'),
  {
    ssr: false,
  }
);

const Borrowing = () => {
  const [isLessThan480] = useMediaQuery('(max-width: 480px)');

  const { address } = useAccount();

  const { getTableData } = GetMarketData();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { allMarketsData } = useStore();

  const {
    setIsLoading,
    setBorrowedCards,
    setSumData,
    borrowedCards,
    sumData,
    selectedPosition,
    setSelectedPosition,
    reloadData,
    setReloadData,
  } = useDashboardStore();

  const borrowData = (allMarketsData: TableData[]) => {
    const borrowedPositions = allMarketsData.filter(
      ({ borrowBalance, configuratorData }) =>
        borrowBalance > BigInt(0) ||
        configuratorData.find(({ totalSupply }) => totalSupply > BigInt(0))
    );

    const sumCollaterals = borrowedPositions.map((data) => {
      return data.configuratorData
        .map((asset) => {
          const colFactor = Number(asset.liquidateCollateralFactor) / 1e18;
          const balance = formatUnits(asset.balanceOf, asset.decimals);
          const price = formatUnits(asset.price, 8);

          return Number(balance) * colFactor * (Number(balance) / Number(price));
        })
        .reduce((a, b) => a + b);
    });

    setBorrowedCards(borrowedPositions);
    setSumData(sumCollaterals);
    setReloadData(false);
  };

  const onBorrowClick = () => {
    if (!address) {
      return onOpen();
    }
  };

  const getBorrowPos = async () => {
    const allPositions = await getTableData();

    if (allPositions?.length) {
      borrowData(removeSepoliaFromTable(allPositions));
    }
  };

  const calcBorrowPowerUsed = ({ data, debt }: { data: TableData; debt: number }) => {
    const borrowCapacity = data.configuratorData
      .map(
        (collateral: AllCollateralData) =>
          Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
          Number(formatUnits(collateral.liquidateCollateralFactor, 18)) *
          Number(formatUnits(collateral.price, priceFeedMantissa))
      )
      .reduce((a: number, b: number) => a + b);
    return ((debt * 100) / borrowCapacity).toFixed(2);
  };

  const DebtValue = (borrowBalance: bigint, decimals: number) => {
    return Number(formatUnits(borrowBalance, decimals)) * 1.01;
  };

  useEffect(() => {
    setIsLoading(false);

    if (address) {
      if (allMarketsData.length && !reloadData) {
        borrowData(removeSepoliaFromTable(allMarketsData));
      } else {
        getBorrowPos();
      }
    } else {
      setBorrowedCards([]);
    }
  }, [address, reloadData]);

  useEffect(() => {
    if (Boolean(address) || (borrowedCards.length && sumData.length)) {
      setIsLoading(true);
    }
  }, [borrowedCards, sumData, address, setIsLoading]);

  return (
    <>
      <Grid
        gridTemplateColumns='1fr'
        bg={!borrowedCards.length ? 'brand.1100' : { base: 'transparent', md: 'brand.1100' }}
        border='1px solid'
        borderColor={!borrowedCards.length ? 'brand.500' : { base: 'transparent', md: 'brand.500' }}
        borderRadius='16px'
        p={!borrowedCards.length ? '24px' : { base: '3px', md: '24px' }}
        justifyItems={!borrowedCards.length ? 'center' : 'normal'}
      >
        <View.Condition if={!borrowedCards.length}>
          <>
            <Flex
              w='100%'
              alignItems='center'
              justifyContent='space-between'
              flexDirection={isLessThan480 ? 'column' : 'row'}
              p={isLessThan480 ? '0' : '0 50px'}
            >
              <Text
                m='24px 0'
                size='2440027'
              >
                <View.Condition if={!address}>Connect wallet to proceed</View.Condition>

                <View.Condition if={Boolean(address && !borrowedCards.length)}>
                  You don`t have active positions yet
                </View.Condition>
              </Text>

              <View.Condition if={!address}>
                <Button
                  w='140px'
                  h='43px'
                  color='brand.750'
                  onClick={onBorrowClick}
                >
                  Connect wallet
                </Button>
              </View.Condition>

              <View.Condition if={Boolean(address && !borrowedCards.length)}>
                <Link href='/borrow'>
                  <Button
                    w='140px'
                    h='43px'
                    color='brand.750'
                  >
                    Borrow
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
          </>
        </View.Condition>

        <View.Condition if={Boolean(borrowedCards.length)}>
          <Text mb='16px'>Borrowed</Text>

          <Grid
            gridTemplateColumns={{ base: '1fr', lg: '1.3fr 1fr' }}
            alignItems='flex-start'
          >
            <Grid
              gridTemplateColumns='1fr'
              gap='16px'
              borderRadius='8px'
              p={{ base: '8px', md: '24px' }}
              bg='brand.750'
            >
              <Text size='small16500140'>Your Positions</Text>

              {borrowedCards.map((data, index) => {
                const debt = DebtValue(data.borrowBalance, Number(data.decimals));
                const bpu = calcBorrowPowerUsed({
                  data: data,
                  debt: debt,
                });

                return (
                  <Grid key={`borrow_${data.asset}_${index}`}>
                    <PositionCard
                      bpu={bpu}
                      data={data}
                      debt={debt}
                      index={index}
                      getBorrowPos={getBorrowPos}
                      selectedPosition={selectedPosition}
                      onSelectedPosition={() => setSelectedPosition(index)}
                    />

                    <Show breakpoint='(max-width: 991px)'>
                      <Collapse in={selectedPosition === index}>
                        <BorrowingCharts
                          selectedPositionData={data}
                          reGetData={getBorrowPos}
                        />
                      </Collapse>
                    </Show>
                  </Grid>
                );
              })}
            </Grid>

            <Show breakpoint='(min-width: 62em)'>
              <BorrowingCharts
                selectedPositionData={borrowedCards[selectedPosition]}
                reGetData={getBorrowPos}
              />
            </Show>
          </Grid>
        </View.Condition>
      </Grid>
    </>
  );
};

export default Borrowing;
