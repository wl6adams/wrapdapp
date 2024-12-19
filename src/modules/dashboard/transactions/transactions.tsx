import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Box, Button, Flex, Grid, Show, Text, useDisclosure } from '@chakra-ui/react';

import {
  HeadingFilterDateType,
  HeadingFilters,
} from '@/modules/dashboard/heading-filters/heading-filters';
import DesctopTransactions from '@/modules/dashboard/transactions/desctop-transactions';
import MobileTransactions from '@/modules/dashboard/transactions/mobile-transactions';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { DirectionType } from '@/shared/consts/constant';
import { Each } from '@/shared/ui/each';
import { View } from '@/shared/ui/view';
import { useDashboardStore } from '@/store/dashboard';
import { TransactionData, useTransactions } from '@/store/transaction';
import { ModalsLayout } from '@/widgets/modal';

const Transactions = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setIsLoading, filter } = useDashboardStore();

  const { transaction, isLoadingEnd } = useTransactions();

  const { address } = useAccount();

  const [isLessThan480] = useMediaQuery('(max-width: 480px)');

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TransactionData;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'date', direction: 'descending' });

  const transactionsData = useMemo(() => {
    if (!address) return [];

    const poorData = Object.values(transaction).flat();

    if (poorData.length) {
      return poorData;
    }

    return [];
  }, [transaction, address]);

  const daysFilter = useMemo(() => {
    const activeDays = filter.find(({ active }) => active);

    const milSecond = 1000 * 60 * 60 * 24 * (activeDays?.value || 1);

    const lastActiveTime = new Date().getTime() - milSecond;

    return transactionsData.filter(({ date }) => date * 1000 > lastActiveTime);
  }, [transactionsData, filter]);

  const sortedData =
    daysFilter &&
    [...daysFilter].sort((a, b) => {
      if (sortConfig !== null) {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
      }
      return 0;
    });

  const isLoaded = Boolean(transactionsData.length) || isLoadingEnd;

  const requestSort = (key: keyof TransactionData, direction: DirectionType = 'ascending') => {
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null);
      return;
    }

    setSortConfig({ key, direction });
  };

  useEffect(() => {
    setIsLoading(true);
  }, []);

  return (
    <>
      <View.Condition if={!transactionsData?.length && !isLoadingEnd}>
        <Box
          border='1px solid'
          bg='brand.1100'
          borderColor='brand.500'
          p='24px'
          borderRadius='16px'
        >
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
              {!address
                ? 'Connect wallet to proceed'
                : !sortedData?.length && 'You don`t have any transactions yet'}
            </Text>

            <View.Condition if={!address}>
              <Button
                w='140px'
                h='43px'
                color='brand.750'
                onClick={onOpen}
              >
                Connect wallet
              </Button>
            </View.Condition>

            <View.Condition if={Boolean(address) && !transactionsData?.length}>
              <Flex gap='10px'>
                <Link href='/lend'>
                  <Button
                    w='140px'
                    h='43px'
                    p='14px 24px'
                    color='brand.750'
                    size='small14500120'
                    fontWeight='500'
                    bg='brand.100'
                    borderRadius='100px'
                  >
                    Lend
                  </Button>
                </Link>

                <Link href='/borrow'>
                  <Button
                    w='140px'
                    h='43px'
                    p='14px 24px'
                    color='brand.750'
                    size='small14500120'
                    fontWeight='500'
                    bg='brand.100'
                    borderRadius='100px'
                  >
                    Borrow
                  </Button>
                </Link>
              </Flex>
            </View.Condition>

            <ModalsLayout
              isHiddenClose
              isOpen={isOpen}
              onClose={onClose}
              bgWhite='brand.150'
              bgBlack='brand.750'
            >
              <WalletConnect closeModal={onClose} />
            </ModalsLayout>
          </Flex>
        </Box>
      </View.Condition>

      <View.Condition if={Boolean(transactionsData?.length)}>
        <Show breakpoint='(max-width: 48em)'>
          <HeadingFilters
            title='Transactions'
            isLoaded={isLoaded}
            type={HeadingFilterDateType.SELECT}
          />

          <Grid
            gridTemplateColumns='1fr'
            rowGap='10px'
          >
            <Each
              data={sortedData}
              render={(row, index) => (
                <MobileTransactions
                  key={`${row.date}_${index}`}
                  transaction={row}
                  isLoaded={isLoaded}
                />
              )}
            />
          </Grid>
        </Show>

        <Show breakpoint='(min-width: 48em)'>
          <Grid
            borderRadius='1rem'
            gridTemplateColumns='1fr'
            p={{ base: '6px', md: '1.5rem' }}
            border={!isLoaded ? 'none' : '1px solid'}
            borderColor={{ base: 'transparent', md: 'brand.500' }}
            bg={{ base: 'transparent', md: !isLoaded ? 'brand.1650' : 'brand.1100' }}
          >
            <HeadingFilters
              title='Transactions'
              isLoaded={isLoaded}
              type={HeadingFilterDateType.SELECT}
            />

            <DesctopTransactions
              isLoaded={isLoaded}
              requestSort={requestSort}
              sortConfig={sortConfig}
              sortedData={sortedData}
            />
          </Grid>
        </Show>
      </View.Condition>
    </>
  );
};

export default Transactions;
