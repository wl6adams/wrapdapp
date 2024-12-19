import React, { memo } from 'react';
import { Image } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { NetworksNames } from '@/shared/web3/config';
import { HomePageDataType } from '@/shared/web3/types';

const Card = memo(
  ({
    isLoaded,
    market,
    onGoDetailsPage,
  }: {
    isLoaded: boolean;
    market: HomePageDataType;
    onGoDetailsPage: (activeCard: HomePageDataType) => void;
  }) => {
    const firstColumn = (market?.totalEarning / market?.totalAll) * 100;

    const secondColumn = (market?.totalBorrowed / market?.totalAll) * 100;

    return (
      <Grid
        minW={{ base: '275px', lg: '300px' }}
        minH={{ base: '174px', lg: '150px' }}
        gap={{ base: '20px', lg: '14px' }}
        p={{ base: '21px 18px', lg: '14px 18px' }}
        border='0.7px solid'
        borderColor='brand.1475'
        borderRadius='28px'
        bg='brand.1100'
        flexShrink='0'
      >
        <Flex gap='10px'>
          <Flex position='relative'>
            <SkeletonCircle
              size='5'
              startColor='brand.150'
              opacity='1'
              isLoaded={isLoaded}
            >
              <Image
                width={18}
                height={18}
                src={`/collaterals/${market?.asset}.svg`}
                alt={market?.asset || 'market'}
              />
            </SkeletonCircle>

            <SkeletonCircle
              size='5'
              ml='-0.5rem'
              opacity='1'
              startColor='brand.150'
              isLoaded={isLoaded}
            >
              <Image
                width={18}
                height={18}
                src={`/markets/${NetworksNames[market?.chainId]?.toLowerCase()}.svg`}
                alt={market?.asset || 'market'}
              />
            </SkeletonCircle>
          </Flex>

          <Skeleton
            borderRadius='36px'
            w='100%'
            h='20px'
            opacity='1'
            startColor='brand.150'
            isLoaded={isLoaded}
          >
            <Text size='medium18500120'>
              {market?.asset}/{NetworksNames[market?.chainId]}
            </Text>
          </Skeleton>
        </Flex>

        <Grid
          templateColumns={`${firstColumn ? firstColumn.toFixed(0) : 50}% ${secondColumn ? secondColumn.toFixed(0) : 50}%`}
          gap='2px'
          boxSizing='border-box'
          position='relative'
        >
          <GridItem>
            <Skeleton
              borderRadius='36px'
              w='100%'
              h='12px'
              opacity='1'
              startColor='brand.150'
              isLoaded={isLoaded}
            >
              <Box
                borderRadius='4px'
                bg='brand.100'
                h='12px'
              />
            </Skeleton>

            <Skeleton
              borderRadius='36px'
              w='100%'
              h='20px'
              opacity='1'
              startColor='brand.150'
              isLoaded={isLoaded}
            >
              <Text
                mt='6px'
                size='small14500140'
                color='brand.100'
                letterSpacing='0.02em'
              >
                ${formatNumber(market?.totalEarning || 0)}
              </Text>
            </Skeleton>
          </GridItem>

          <GridItem>
            <Skeleton
              borderRadius='36px'
              w='100%'
              h='12px'
              opacity='1'
              startColor='brand.150'
              isLoaded={isLoaded}
            >
              <Box
                borderRadius='4px'
                bg='brand.1375'
                h='12px'
              />
            </Skeleton>

            <Skeleton
              borderRadius='36px'
              w='100%'
              h='20px'
              opacity='1'
              startColor='brand.150'
              isLoaded={isLoaded}
            >
              <Text
                mt='6px'
                size='small14500140'
                color='brand.1375'
                letterSpacing='0.02em'
              >
                ${formatNumber(market?.totalBorrowed || 0)}
              </Text>
            </Skeleton>
          </GridItem>
        </Grid>

        <Skeleton
          borderRadius='30px'
          w='100%'
          h='30px'
          opacity='1'
          startColor='brand.150'
          isLoaded={isLoaded}
        >
          <Button
            h='30px'
            w='100%'
            bg='#FFFFFF0D'
            border='0.7px solid'
            borderColor='brand.1150'
            onClick={() => onGoDetailsPage(market)}
          >
            Start Earning
          </Button>
        </Skeleton>
      </Grid>
    );
  }
);

const Cards = memo(
  ({
    isLoaded,
    activeCards,
    onGoDetailsPage,
  }: {
    isLoaded: boolean;
    activeCards: HomePageDataType[];
    onGoDetailsPage: (activeCard: HomePageDataType) => void;
  }) => {
    return (
      <Flex
        ml='10px'
        gap={{ base: '10px', lg: '14px' }}
        _last={{ ml: '0' }}
      >
        <Each
          data={activeCards || Array(20).fill(1)}
          render={(market, index) => (
            <Card
              key={index}
              isLoaded={isLoaded}
              market={market}
              onGoDetailsPage={onGoDetailsPage}
            />
          )}
        />
      </Flex>
    );
  }
);

export { Card, Cards };
