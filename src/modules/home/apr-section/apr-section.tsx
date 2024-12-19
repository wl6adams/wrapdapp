'use client';

import { memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Flex, Grid, GridItem, Text } from '@chakra-ui/react';

import { useStoreHome } from '@/store/home';

const AprSection = memo(() => {
  const router = useRouter();

  const { marketsData } = useStoreHome();

  const onRoute = (link: string) => {
    router.push(`/${link}`);
  };

  const highestAPRLend = useMemo(() => {
    if (!marketsData.length) {
      return 0;
    }

    return Math.max(...marketsData.map(({ netEarnAPY }) => netEarnAPY));
  }, [marketsData]);

  const lowAPRBorrow = useMemo(() => {
    if (!marketsData.length) {
      return 0;
    }

    return Math.min(...marketsData.map(({ netBorrowAPY }) => netBorrowAPY));
  }, [marketsData]);

  return (
    <Flex
      zIndex={2}
      position='relative'
      m={{ base: '40px 16px 0', lg: '50px 0 0 0' }}
      justifyContent='center'
    >
      <Grid
        w='100%'
        maxW='1200px'
        gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        gap='1.5rem'
        p={{ base: '12px', lg: '1.5rem' }}
        border='1px solid'
        borderColor='brand.1475'
        borderRadius='2rem'
      >
        <GridItem
          display='grid'
          alignItems='center'
          alignContent='center'
          border='1px solid'
          borderColor='brand.1475'
          p={{ base: '27px 16px', lg: '25px 40px' }}
          borderRadius='1.5rem'
          bg='brand.1100'
          justifyItems='center'
          h={{ base: 'auto', lg: '123px' }}
        >
          <Flex
            w='100%'
            alignItems='center'
            justifyContent='space-between'
            gap={{ base: '24px', lg: 'initial' }}
            flexDirection={{ base: 'column', lg: 'row' }}
          >
            <Grid justifyItems={{ base: 'center', lg: 'initial' }}>
              <Text size='4070048'>Lend</Text>

              <Text size='1870021'>Earn up to {highestAPRLend.toFixed(2)}% APR</Text>
            </Grid>

            <Button
              color='brand.150'
              h='44px'
              onClick={() => onRoute('lend')}
            >
              Start Lending
            </Button>
          </Flex>
        </GridItem>

        <GridItem
          display='grid'
          alignItems='center'
          alignContent='center'
          border='1px solid'
          borderColor='brand.1475'
          p={{ base: '27px 16px', lg: '25px 40px' }}
          borderRadius='1.5rem'
          bg='brand.1100'
          justifyItems='center'
          h={{ base: 'auto', lg: '123px' }}
        >
          <Flex
            w='100%'
            alignItems='center'
            justifyContent='space-between'
            gap={{ base: '24px', lg: 'initial' }}
            flexDirection={{ base: 'column', lg: 'row' }}
          >
            <Grid justifyItems={{ base: 'center', lg: 'initial' }}>
              <Text size='4070048'>Borrow</Text>

              <Text size='1870021'>Borrow rates as low as {lowAPRBorrow.toFixed(2)}% APR</Text>
            </Grid>

            <Button
              color='brand.150'
              h='44px'
              onClick={() => onRoute('borrow')}
            >
              Start Borrowing
            </Button>
          </Flex>
        </GridItem>
      </Grid>
    </Flex>
  );
});

export default AprSection;
