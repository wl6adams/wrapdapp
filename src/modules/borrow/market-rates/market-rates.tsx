'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';

import InterestRateModel from '@/modules/borrow/interest-rate-model/interest-rate-model';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { useStore } from '@/store';

const MarketRates = () => {
  const { selectedMarketData } = useStore();

  const netEarnAPR = useMemo(() => {
    let total = '0';
    let interest = '0';
    let interestPercent = '0';
    let compReward = '0';
    let compRewardPercent = '0';

    if (selectedMarketData) {
      total = selectedMarketData.netEarnAPY.toFixed(2);

      interest = selectedMarketData.supplyApr.toFixed(2);

      interestPercent = ((selectedMarketData.supplyApr / Number(total)) * 100).toFixed(2);

      compReward = selectedMarketData.supplyCompRewardApr.toFixed(2);

      compRewardPercent = ((selectedMarketData.supplyCompRewardApr / Number(total)) * 100).toFixed(
        2
      );
    }

    return { total, interest, interestPercent, compReward, compRewardPercent };
  }, [selectedMarketData]);

  const netBorrowAPR = useMemo(() => {
    let total = '0';
    let interest = '0';
    let interestPercent = '0';
    let compReward = '0';
    let compRewardPercent = '0';
    const percentW = '0';

    if (selectedMarketData) {
      total = selectedMarketData.netBorrowAPY.toFixed(2);

      interest = selectedMarketData.borrowApr.toFixed(2);

      compReward = selectedMarketData.borrowCompRewardApr.toFixed(2);

      compRewardPercent = (
        (selectedMarketData.borrowCompRewardApr / Number(interest)) *
        100
      ).toFixed(2);

      interestPercent = '100';
    }

    return { total, interest, interestPercent, compReward, compRewardPercent, percentW };
  }, [selectedMarketData]);

  //TODO create function or hook for calculate percent
  const netEarnAPRColumn = useMemo(() => {
    const interest = +netEarnAPR.interestPercent > 80 ? 80 : +netEarnAPR.interestPercent;

    const maxPercentForCompound = interest > 80 ? 20 : 100 - interest;

    const compound = +netEarnAPR.compRewardPercent > 80 ? 80 : maxPercentForCompound;

    return {
      interestPercent: interest,

      compRewardPercent: compound,
    };
  }, [netEarnAPR.interestPercent, netEarnAPR.compRewardPercent]);

  return (
    <Flex
      gap='1rem'
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      <Grid
        flex='1'
        gap='0.5rem'
      >
        <Text size='medium18500120'>Market Rates</Text>

        <Grid
          p='1rem 1.5rem'
          gap='1rem'
          bg='brand.750'
          borderRadius='8px'
        >
          <Box>
            <Text
              size='small14500140'
              color='brand.650'
            >
              Net Borrow APR
            </Text>
            <Text size='medium18500120'>{netBorrowAPR.total}%</Text>
          </Box>

          <Grid
            templateColumns='1fr'
            gap='2px'
            position='relative'
            boxSizing='border-box'
          >
            <GridItem
              h='2rem'
              borderRadius='4px'
              bg='brand.1375'
            />

            <GridItem
              minW='5rem'
              maxW='98.9%'
              w={`${netBorrowAPR.compRewardPercent}%`}
              display={Number(netBorrowAPR.compReward) <= 0 ? 'none' : 'block'}
              position='absolute'
              right='3px'
              top='4px'
              h='1.5rem'
              borderRadius='3px'
              bg='brand.linearGradient.75'
            />
          </Grid>

          <Grid
            templateColumns='repeat(2, 1fr)'
            gap='2px'
            position='relative'
            boxSizing='border-box'
            mt='-0.5rem'
          >
            <Flex
              gap='4px'
              alignItems='center'
            >
              <Text size='large12500140'>{netBorrowAPR.interest}%</Text>

              <Text
                size='large12500140'
                color='brand.650'
              >
                Interest
              </Text>

              <InfoToolTip label='Borrow Interest in selected token' />
            </Flex>

            <Flex
              gap='4px'
              alignItems='center'
              justifyContent='end'
            >
              <Image
                width={16}
                height={16}
                src='/market-rates/comp.svg'
                alt='comp'
              />

              <Text size='large12500140'>{netBorrowAPR.compReward}%</Text>

              <InfoToolTip label='Borrow Interest compensated by earning COMP token' />
            </Flex>
          </Grid>
        </Grid>

        <Grid
          p='1rem 1.5rem'
          gap='1rem'
          bg='brand.750'
          borderRadius='8px'
        >
          <Box>
            <Text
              size='small14500140'
              color='brand.650'
            >
              Net Earn APR
            </Text>
            <Text size='medium18500120'>{netEarnAPR.total}%</Text>
          </Box>

          <Flex
            gap='2px'
            position='relative'
            boxSizing='border-box'
          >
            <GridItem
              minW='6.25rem'
              w={`${Number(netBorrowAPR.compReward) <= 0 ? 100 : netEarnAPRColumn.interestPercent}%`}
              h='2rem'
              borderRadius='4px'
              bg='brand.450'
            />

            <GridItem
              display={Number(netBorrowAPR.compReward) <= 0 ? 'none' : 'block'}
              minW='5rem'
              w={`${netEarnAPRColumn.compRewardPercent}%`}
              position='relative'
              h='2rem'
              borderRadius='4px'
              bg='brand.100'
            />

            {/*<GridItem>*/}
            {/*  <Box h="2rem" borderRadius="4px" bg="brand.1400" />*/}
            {/*  <Flex gap="4px" mt="0.5rem">*/}
            {/*    <Image width={16} height={16} src="/market-rates/mantle.svg" alt="base" />*/}
            {/*    <Text size="large12500140">0.00%</Text>*/}
            {/*<InfoToolTip*/}
            {/*    label="A portion of the Net Earn APR earned in Mantel token"*/}
            {/*/>*/}
            {/*  </Flex>*/}
            {/*</GridItem>*/}
          </Flex>

          <Flex
            gap='2px'
            position='relative'
            boxSizing='border-box'
            mt='-1rem'
          >
            <Flex
              minW='6.25rem'
              w={`${netEarnAPRColumn.interestPercent}%`}
              gap='4px'
              mt='0.5rem'
              alignItems='center'
            >
              <Text size='large12500140'>{netEarnAPR.interest}%</Text>

              <Text
                size='large12500140'
                color='brand.650'
              >
                Interest
              </Text>

              <InfoToolTip label='Portion of the Net Earn APR in selected token' />
            </Flex>

            <Flex
              display={Number(netBorrowAPR.compReward) <= 0 ? 'none' : 'flex'}
              w={`${netEarnAPRColumn.compRewardPercent}%`}
              minW='5rem'
              gap='4px'
              mt='0.5rem'
              alignItems='center'
              justifyContent='end'
            >
              <Image
                width={16}
                height={16}
                src='/market-rates/comp.svg'
                alt='comp'
              />

              <Text size='large12500140'>{netEarnAPR.compReward}%</Text>

              <InfoToolTip label='A portion of the Net Earn APR earned in COMP token' />
            </Flex>
          </Flex>
        </Grid>
      </Grid>

      {selectedMarketData && (
        <InterestRateModel
          borrowInterest={netBorrowAPR.interest}
          supplyInterest={netEarnAPR.interest}
        />
      )}
    </Flex>
  );
};

export default MarketRates;
