'use client';

import React, { memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Button, Flex, Grid, Show, Text } from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';
import { useStoreHome } from '@/store/home';

import { StartEarningInfoCards } from './start-earning-info-cards/start-earning-info-cards';

const StartEarning = memo(() => {
  const router = useRouter();

  const { marketsData } = useStoreHome();

  const [isLessThan800] = useMediaQuery('(max-width: 800px)');

  const total = useMemo(() => {
    let totalBorrow = 0;
    let totalCollateral = 0;

    if (marketsData?.length) {
      totalBorrow = marketsData.map((data) => data.totalBorrowed).reduce((a, b) => a + b);

      totalCollateral = marketsData.map((data) => data.totalEarning).reduce((a, b) => a + b);
    }

    return { totalBorrow, totalCollateral };
  }, [marketsData]);

  const onRoute = (link: string) => {
    router.push(`/${link}`);
  };

  return (
    <Grid
      mt={{ base: '40px', lg: '60px' }}
      position='relative'
    >
      {/*<Suspense*/}
      {/*  fallback={*/}
      {/*    <Box*/}
      {/*      height={isLessThan800 ? '600px' : '400px'}*/}
      {/*      opacity={isLessThan800 ? 0.5 : 0.7}*/}
      {/*      maxWidth={isLessThan800 ? '500px' : '100%'}*/}
      {/*      position="absolute"*/}
      {/*      top={isLessThan800 ? '15%' : '40%'}*/}
      {/*      left="50%"*/}
      {/*      transform={`translate(-50%, -50%) scale(${isLessThan800 ? 0.7 : 1.3})`}*/}
      {/*    />*/}
      {/*  }*/}
      {/*>*/}
      {/*  <StartEarningAnimation />*/}
      {/*</Suspense>*/}

      <video
        muted
        loop
        autoPlay
        playsInline
        controls={false}
        style={{
          height: isLessThan800 ? '600px' : '400px',
          opacity: isLessThan800 ? 0.5 : 0.7,
          maxWidth: isLessThan800 ? '500px' : '100%',
          position: 'absolute',
          top: isLessThan800 ? '10%' : '43%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isLessThan800 ? 2 : 2.3})`,
        }}
      >
        <source
          src='/chip.mp4'
          type='video/mp4'
        />
      </video>

      <Grid
        gap='60px'
        justifyItems='center'
        zIndex={1}
      >
        <Flex
          w={{ base: 'auto', lg: '1010px' }}
          flexDirection={{ base: 'column', lg: 'row' }}
          gap={{ base: '20px', lg: 'initial' }}
          justifyContent='space-between'
        >
          <Grid justifyItems='center'>
            <Text
              size={isLessThan800 ? 'large3270038' : 'large5480065'}
              color='brand.1550'
            >
              ${formatNumber(total.totalBorrow)}
            </Text>

            <Text
              size={isLessThan800 ? 'small14500140' : '2450024'}
              lineHeight='normal'
              bg='brand.linearGradient.25'
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              of borrowing backed by
            </Text>
          </Grid>

          <Grid justifyItems='center'>
            <Text
              size={isLessThan800 ? 'large3270038' : 'large5480065'}
              color='brand.450'
            >
              ${formatNumber(total.totalCollateral)}
            </Text>

            <Text
              size={isLessThan800 ? 'small14500140' : '2450024'}
              lineHeight='normal'
              bg='brand.linearGradient.25'
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              of collateral across {marketsData?.length} markets
            </Text>
          </Grid>
        </Flex>

        <Button
          w='348px'
          color='brand.150'
          h={{ base: '44px', lg: '56px' }}
          onClick={() => onRoute('market')}
        >
          Start Earning
        </Button>

        <Grid
          gap={{ base: '25px', lg: '6px' }}
          justifyItems='center'
          maxW='560px'
        >
          <Text size='large3270038'>Compound</Text>

          <Text
            textAlign='center'
            size='medium16500140'
            color='brand.250'
            m={{ base: '0 32px', lg: '0' }}
          >
            An open community-governed platform that allows anyone to earn yield, borrow assets, and
            build applications on top
          </Text>
        </Grid>

        <Show breakpoint='(min-width: 769px)'>
          <StartEarningInfoCards />
        </Show>
      </Grid>

      <Show breakpoint='(max-width: 768px)'>
        <StartEarningInfoCards />
      </Show>
    </Grid>
  );
});

export default StartEarning;
