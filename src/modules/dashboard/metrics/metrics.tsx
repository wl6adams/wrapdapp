'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Grid,
  Show,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';

import ClaimComp from '@/modules/dashboard/claim-comp/claim-comp';
import { findUserIpfsHash, getUserData } from '@/shared/api/api';
import { QUERY_KEYS } from '@/shared/api/queryKeys';
import { UsersDataTypes } from '@/shared/api/types';
import { formatCommaNumber, formatNumber, removeSepoliaFromTable } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { InfoToolTip } from '@/shared/ui/info-tooltip';
import { View } from '@/shared/ui/view';
import { priceFeedMantissa } from '@/shared/web3/hook/getMarketData';
import { useMultiChainRewardOwed } from '@/shared/web3/hook/getTotalCompClaimTokens';
import { AllCollateralData, TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import useCompEarnedStore from '@/store/comp-earned';

const Metrics = () => {
  const { allMarketsData } = useStore();

  const [isLoadedMetrics, setIsLoadedMetrics] = useState<boolean>(false);

  const { totalCompData } = useCompEarnedStore();

  const [totalBorrowed, setTotalBorrowedUSD] = useState<number>(0);

  const [totalCollateralsSupply, setTotalCollateralsSupply] = useState<number>(0);

  const [isToggleClaim, setIsToggleClaim] = useState<boolean>(false);

  const [totalEarnedFunds, setTotalEarnedFunds] = useState<number>(0);

  const [totalLended, setTotalLended] = useState<number>(0);

  const { address } = useAccount();

  const { getMetrics } = useMultiChainRewardOwed();

  const total = useMemo(() => {
    if (!totalCompData.length) {
      return 0;
    }

    return totalCompData.map(({ result }) => result).reduce((a, b) => a + b);
  }, [totalCompData]);

  const totalPercent = useMemo(() => {
    if (totalCollateralsSupply > 0) {
      const one_percent = totalCollateralsSupply / 100;

      return totalBorrowed / one_percent;
    }
    return 0;
  }, [totalBorrowed, totalCollateralsSupply]);

  const onToggle = () => {
    setIsToggleClaim(!isToggleClaim);
  };

  const totalEarnedFundsNumber = useMemo(() => {
    if (Number(totalEarnedFunds) === 0) return '0.00';

    return totalEarnedFunds > 10000000
      ? formatNumber(totalEarnedFunds)
      : formatCommaNumber(totalEarnedFunds.toString(), 2);
  }, [totalEarnedFunds]);

  const totalBorrowedCalc = (allMarketsData: any) => {
    const filteredBorrowedData = allMarketsData.filter(
      (data: TableData) => data.borrowBalance > BigInt(0)
    );

    if (filteredBorrowedData.length) {
      const totalBorrowedUSD = filteredBorrowedData
        .map(
          (data: TableData) =>
            Number(formatUnits(data.borrowBalance, Number(data.decimals))) * data.price
        )
        .reduce((a: number, b: number) => a + b);

      setTotalBorrowedUSD(totalBorrowedUSD);

      const totalCollateralsSupplyUSD = filteredBorrowedData
        .flatMap((data: TableData) =>
          data.configuratorData.map(
            (collateral: AllCollateralData) =>
              Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
              Number(formatUnits(collateral.liquidateCollateralFactor, 18)) *
              Number(formatUnits(collateral.price, priceFeedMantissa))
          )
        )
        .reduce((a: number, b: number) => a + b);

      setTotalCollateralsSupply(totalCollateralsSupplyUSD);
    }

    const filteredLended = allMarketsData.filter(
      (data: TableData) => data.supplyBalance > BigInt(0)
    );

    if (filteredLended.length) {
      const totalLendedUSD = filteredLended
        .map(
          (data: TableData) =>
            Number(formatUnits(data.supplyBalance, Number(data.decimals))) * data.price
        )
        .reduce((a: number, b: number) => a + b);

      setTotalLended(totalLendedUSD);
    }
  };

  const getCompaundData = async () => {
    const totalComp = await getMetrics();

    if (totalComp) {
      setIsLoadedMetrics(true);
    }
  };

  useEffect(() => {
    (async () => {
      if (address) {
        getCompaundData();
      }
    })();
  }, [address]);

  useEffect(() => {
    if (allMarketsData.length) {
      totalBorrowedCalc(removeSepoliaFromTable(allMarketsData));
    }
  }, [allMarketsData]);

  const { data: usersUrls } = useQuery({
    queryKey: [QUERY_KEYS.getUsersUrls],
    queryFn: () => findUserIpfsHash(),
  });

  const { mutateAsync } = useMutation({
    mutationFn: getUserData,
  });

  const calculateTotalEarned = (currentUserData: UsersDataTypes) => {
    return Object.values(currentUserData.networks)
      .map((data) => Number(data.totalEarnUsd))
      .reduce((a, b) => a + b, 0);
  };

  useEffect(() => {
    if (usersUrls && address) {
      let ipfsHash = '';

      const currentUserAddress = address.toLowerCase();

      const isAddressPresent = Object.entries(usersUrls).some(([key, addresses]) => {
        if (Array.isArray(addresses)) {
          return addresses?.some((userAddress) => {
            if (userAddress === currentUserAddress) {
              ipfsHash = key;

              return true;
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      });
      if (!isAddressPresent) {
        return;
      }

      mutateAsync(ipfsHash).then((response) => {
        if (response) {
          const currentUserData = response[currentUserAddress];
          if (currentUserData) {
            const userTotalEarned = calculateTotalEarned(currentUserData);

            setTotalEarnedFunds(userTotalEarned);
          }
        }
      });
    }
  }, [usersUrls, address, mutateAsync]);

  return (
    <>
      <View.Condition if={Boolean(address)}>
        <Grid
          gridTemplateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
          gap={{ base: '8px', md: '16px' }}
        >
          <Skeleton
            borderRadius='16px'
            height={{ base: 'auto', md: '86px' }}
            isLoaded={isLoadedMetrics}
          >
            <Show breakpoint='(min-width: 768px)'>
              <Grid
                cursor='pointer'
                gridTemplateColumns={{ base: '108px 1fr', lg: '1fr .8fr' }}
                gap='8px'
                p={{ base: '8px', md: '14px 16px 4px' }}
                borderRadius='16px'
                bg='brand.1100'
                alignItems='center'
                position='relative'
                zIndex={3}
                justifyContent={{ base: 'space-between', md: 'flex-start' }}
                minH={{ base: 'auto', md: '86px' }}
              >
                <Flex
                  gap='4px'
                  alignItems='center'
                >
                  <Text size='small14500120'>COMP Earned</Text>

                  <InfoToolTip
                    fontSize='14px'
                    lineHeight='140%'
                    maxW='185px'
                    bg='brand.400'
                    color='brand.300'
                    borderRadius='0.25rem'
                    label='COMP rewards earned across different networks'
                  />
                </Flex>

                <Flex
                  alignItems='center'
                  gridArea={{ base: '1 / 2', md: '2/ 1' }}
                  gap='8px'
                  justifySelf={{ base: 'flex-end', md: 'flex-start' }}
                >
                  <Image
                    style={{
                      flexShrink: 0,
                    }}
                    width={28}
                    height={28}
                    src='/logo.svg'
                    alt='comp'
                  />

                  <Text size='large20600110'>{total.toFixed(5)}</Text>
                </Flex>

                <ClaimComp
                  getData={() => getMetrics(true)}
                  allCompData={totalCompData}
                />
              </Grid>
            </Show>

            <Show breakpoint='(max-width: 767px)'>
              <Grid>
                <Flex
                  justifyContent='space-between'
                  alignItems='center'
                  p={{ base: '17.5px 16px', md: '16px' }}
                  borderRadius={isToggleClaim ? '16px 16px 0 0' : '16px'}
                  bg='brand.1100'
                  minH={{ base: 'auto', md: '86px' }}
                >
                  <Grid gap='8px'>
                    <Text size='small14500140'>COMP Earned</Text>

                    <Flex gap='8px'>
                      <Image
                        style={{
                          flexShrink: 0,
                        }}
                        width={24}
                        height={24}
                        src='/logo.svg'
                        alt='comp'
                      />

                      <Text size='large20600110'>{total.toFixed(2)}</Text>
                    </Flex>
                  </Grid>

                  <Button
                    gap='8px'
                    maxW='160px'
                    variant='lendMoreButtons'
                    onClick={onToggle}
                    justifyContent='space-between'
                  >
                    Claim
                    <Image
                      width={16}
                      height={16}
                      style={{
                        transform: isToggleClaim ? 'rotate(360deg)' : 'rotate(180deg)',
                      }}
                      src='/chevron.svg'
                      alt='chevron'
                    />
                  </Button>
                </Flex>

                <ClaimComp
                  isToggleOpen={isToggleClaim}
                  getData={() => getMetrics(true)}
                  allCompData={totalCompData}
                />
              </Grid>
            </Show>
          </Skeleton>

          {/*<Skeleton*/}
          {/*  borderRadius="16px"*/}
          {/*  height={{ base: 'auto', md: '86px' }}*/}
          {/*  isLoaded={isLoadedMetrics}*/}
          {/*>*/}
          {/*  <Show breakpoint="(min-width: 768px)">*/}
          {/*    <Grid*/}
          {/*      minH={{ base: 'auto', md: '86px' }}*/}
          {/*      gridTemplateColumns="1fr .8fr"*/}
          {/*      gap="8px"*/}
          {/*      p={{ base: '8px', md: '14px 16px 4px' }}*/}
          {/*      borderRadius="16px"*/}
          {/*      bg="brand.1100"*/}
          {/*      alignItems="center"*/}
          {/*      position="relative"*/}
          {/*      zIndex={3}*/}
          {/*      justifyContent={{ base: 'space-between', md: 'flex-start' }}*/}
          {/*    >*/}
          {/*      <Text size="small14500120">Mantle Earned</Text>*/}

          {/*      <Flex*/}
          {/*        alignItems="center"*/}
          {/*        gridArea={{ base: '1 / 2', md: '2/ 1' }}*/}
          {/*        gap="8px"*/}
          {/*        justifySelf={{ base: 'flex-end', md: 'flex-start' }}*/}
          {/*      >*/}
          {/*        <Image*/}
          {/*          style={{*/}
          {/*            flexShrink: 0,*/}
          {/*          }}*/}
          {/*          width={28}*/}
          {/*          height={28}*/}
          {/*          src="/market-rates/mantle.svg"*/}
          {/*          alt="comp"*/}
          {/*        />*/}

          {/*        <Text size="large20600110">{(0.0).toFixed(4)}</Text>*/}
          {/*        /!*<Text size="large24600110">{Number(formatUnits(total, 18)).toFixed(4)}</Text>*!/*/}
          {/*      </Flex>*/}

          {/*      <ClaimMantle getData={() => getCompaundData()} allCompData={totalCompData} />*/}
          {/*    </Grid>*/}
          {/*  </Show>*/}

          {/*  /!*<Show breakpoint="(max-width: 767px)">*!/*/}
          {/*  /!*  <Grid>*!/*/}
          {/*  /!*    <Flex*!/*/}
          {/*  /!*      justifyContent="space-between"*!/*/}
          {/*  /!*      alignItems="center"*!/*/}
          {/*  /!*      p={{ base: '17.5px 16px', md: '16px' }}*!/*/}
          {/*  /!*      borderRadius={isToggleClaim ? '16px 16px 0 0' : '16px'}*!/*/}
          {/*  /!*      bg="brand.1100"*!/*/}
          {/*  /!*    >*!/*/}
          {/*  /!*      <Grid gap="8px">*!/*/}
          {/*  /!*        <Text size="small14500140">Mantle Earned</Text>*!/*/}

          {/*  /!*        <Flex gap="8px">*!/*/}
          {/*  /!*          <Image*!/*/}
          {/*  /!*            style={{*!/*/}
          {/*  /!*              flexShrink: 0,*!/*/}
          {/*  /!*            }}*!/*/}
          {/*  /!*            width={28}*!/*/}
          {/*  /!*            height={28}*!/*/}
          {/*  /!*            src="/market-rates/mantle.svg"*!/*/}
          {/*  /!*            alt="comp"*!/*/}
          {/*  /!*          />*!/*/}

          {/*  /!*          <Text size="large24700120">{Number(formatUnits(total, 18)).toFixed(2)}</Text>*!/*/}
          {/*  /!*        </Flex>*!/*/}
          {/*  /!*      </Grid>*!/*/}

          {/*  /!*      <Button gap="8px" maxW="160px" variant="lendMoreButtons" onClick={onToggle}>*!/*/}
          {/*  /!*        Claim*!/*/}
          {/*  /!*        <Image*!/*/}
          {/*  /!*          width={16}*!/*/}
          {/*  /!*          height={16}*!/*/}
          {/*  /!*          style={{*!/*/}
          {/*  /!*            transform: isToggleClaim ? 'rotate(360deg)' : 'rotate(180deg)',*!/*/}
          {/*  /!*          }}*!/*/}
          {/*  /!*          src="/chevron.svg"*!/*/}
          {/*  /!*          alt="chevron"*!/*/}
          {/*  /!*        />*!/*/}
          {/*  /!*      </Button>*!/*/}
          {/*  /!*    </Flex>*!/*/}

          {/*  /!*    <ClaimMantle*!/*/}
          {/*  /!*      isToggleOpen={isToggleClaim}*!/*/}
          {/*  /!*      getData={() => getCompaundData()}*!/*/}
          {/*  /!*      allCompData={totalCompData}*!/*/}
          {/*  /!*    />*!/*/}
          {/*  /!*  </Grid>*!/*/}
          {/*  /!*</Show>*!/*/}
          {/*</Skeleton>*/}

          <Skeleton
            borderRadius='16px'
            height={{ base: 'auto', md: '86px' }}
            isLoaded={isLoadedMetrics}
          >
            <Grid
              cursor='pointer'
              gridTemplateColumns='1fr'
              gap='8px'
              alignItems='center'
              p={{ base: '14.5px 16px', md: '16px' }}
              borderRadius='16px'
              bg='brand.1100'
              justifyContent='start'
              minH={{ base: 'auto', md: '86px' }}
            >
              <Flex
                gap='4px'
                alignItems='center'
              >
                <Text
                  fontSize={{ base: '13px', lg: '14px' }}
                  size='small14500120'
                >
                  Total Earned funds
                </Text>

                <InfoToolTip
                  fontSize='14px'
                  lineHeight='140%'
                  maxW='185px'
                  bg='brand.400'
                  color='brand.300'
                  borderRadius='0.25rem'
                  label='Total funds earned from all lending positions'
                />
              </Flex>

              <Text
                w='100%'
                justifySelf={{ base: 'flex-end', md: 'flex-start' }}
                size={{ base: 'large24700120', md: 'large20600110' }}
              >
                {totalEarnedFundsNumber} USD
              </Text>
            </Grid>
          </Skeleton>

          <Skeleton
            borderRadius='16px'
            height={{ base: 'auto', md: '86px' }}
            isLoaded={isLoadedMetrics}
          >
            <Grid
              cursor='pointer'
              gridTemplateColumns='1fr'
              gap='8px'
              alignItems='center'
              p={{ base: '14.5px 16px', md: '16px' }}
              borderRadius='16px'
              bg='brand.1100'
              justifyContent='start'
              minH={{ base: 'auto', md: '86px' }}
            >
              <Flex
                gap='4px'
                alignItems='center'
              >
                <Text size='small14500120'>Lent</Text>

                <InfoToolTip
                  fontSize='14px'
                  lineHeight='140%'
                  maxW='185px'
                  bg='brand.400'
                  color='brand.300'
                  borderRadius='0.25rem'
                  label='Total assets lent out and earning interest'
                />
              </Flex>

              <Text
                w='100%'
                justifySelf={{ base: 'flex-end', md: 'flex-start' }}
                size={{ base: 'large24700120', md: 'large20600110' }}
              >
                {totalLended > 10000000
                  ? formatNumber(totalLended)
                  : formatCommaNumber(totalLended.toString(), 2)}{' '}
                USD
              </Text>
            </Grid>
          </Skeleton>

          <Skeleton
            borderRadius='16px'
            height={{ base: 'auto', md: '86px' }}
            isLoaded={isLoadedMetrics}
          >
            <Flex
              gap='8px'
              p='10px 16px'
              borderRadius='16px'
              alignItems='center'
              bg='brand.1100'
              minH={{ base: 'auto', md: '86px' }}
            >
              <Box
                display='flex'
                gridArea='span 2 / 1'
                justifyContent='center'
                alignItems='center'
                bg='gray.800'
              >
                <CircularProgress
                  value={totalPercent}
                  size='60px'
                  thickness='12px'
                  trackColor='brand.350'
                  color='brand.100'
                  bg='brand.1100'
                >
                  <CircularProgressLabel color='white'>
                    <Text size='small10400120'>{totalPercent.toFixed(2)}%</Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Box>

              <Grid gap='8px'>
                <Flex
                  gap='4px'
                  alignItems='center'
                >
                  <Text size='small14500120'>Borrowed</Text>

                  <InfoToolTip
                    fontSize='14px'
                    lineHeight='140%'
                    maxW='185px'
                    bg='brand.400'
                    color='brand.300'
                    borderRadius='0.25rem'
                    label='Total assets borrowed and maximum borrowing capacity'
                  />
                </Flex>

                <Flex
                  w='100%'
                  flexDirection={{ base: 'row', md: 'column' }}
                  justifySelf={{ base: 'flex-end', md: 'flex-start' }}
                  alignItems={{ base: 'center', md: 'flex-start' }}
                  gap='4px'
                >
                  <Text size={{ base: '1870021', md: 'small16600110' }}>
                    {totalBorrowed > 1000000
                      ? formatNumber(totalBorrowed)
                      : formatCommaNumber(totalBorrowed.toString(), 2)}{' '}
                    USD
                  </Text>

                  <Text
                    size={{ base: '1870021', md: 'small16400110' }}
                    color='brand.700'
                  >
                    of{' '}
                    {totalCollateralsSupply > 100000
                      ? formatNumber(totalCollateralsSupply)
                      : formatCommaNumber(totalCollateralsSupply.toString(), 2)}{' '}
                    USD
                  </Text>
                </Flex>
              </Grid>
            </Flex>
          </Skeleton>

          <Show breakpoint='(max-width: 47em)'>
            <Box
              w='100%'
              m='10px 0 '
            >
              <Divider maxW={400} />
            </Box>
          </Show>
        </Grid>
      </View.Condition>
    </>
  );
};

export default Metrics;
