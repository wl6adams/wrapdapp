'use client';

import React, { memo, useEffect, useMemo } from 'react';
import Slider from 'react-slick';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Box, Show } from '@chakra-ui/react';

import { Card, Cards } from '@/modules/home/slider-section/card/card';
import { Marquee } from '@/shared/ui/marquee';
import { MARKET_ADDRESSES_HOME, NetworksNames } from '@/shared/web3/config';
import HomePageData from '@/shared/web3/hook/getHomePageData';
import { HomePageDataType } from '@/shared/web3/types';
import { useStoreHome } from '@/store/home';
import { useRPCStore } from '@/store/rpc';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SliderSection = memo(() => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    variableWidth: true,
    autoplaySpeed: 2000,
    speed: 500,
    cssEase: 'ease',
  };

  const router = useRouter();

  const { marketsData, isLoading, setMarketsData, setIsLoading } = useStoreHome();

  const { lastChange } = useRPCStore();

  const { getHomePageData } = HomePageData();

  const { address } = useAccount();

  const showCards: HomePageDataType[] = useMemo(() => {
    if (marketsData.length) {
      return marketsData.filter(({ chainId, asset }) => {
        if (MARKET_ADDRESSES_HOME[chainId]) {
          return Object.keys(MARKET_ADDRESSES_HOME[chainId]).includes(asset);
        }
        return false;
      });
    }
    return Array(20).fill(1);
  }, [marketsData]);

  const onGoDetailsPage = (market: HomePageDataType) => {
    router.push(
      `/market/${market.asset.toLowerCase()}-${NetworksNames[market.chainId].toLowerCase()}`,
      { scroll: true }
    );
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getHomePageData();

        if (response?.length) {
          setMarketsData(response);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [lastChange, address]);

  return (
    <>
      <Show breakpoint='(max-width: 799px)'>
        <Box
          position='relative'
          mt={{ base: '0', lg: '-200px' }}
          ml='16px'
          maxH='174px'
          className='mobile-carousel-box'
        >
          <Slider {...settings}>
            {showCards.map((market, index) => (
              <Card
                key={index}
                isLoaded={!isLoading}
                market={market}
                onGoDetailsPage={onGoDetailsPage}
              />
            ))}
          </Slider>
        </Box>
      </Show>

      <Show breakpoint='(min-width: 800px)'>
        <Marquee
          mt={{ base: '0', lg: '-200px' }}
          time='60s'
        >
          <Cards
            isLoaded={!isLoading}
            activeCards={showCards}
            onGoDetailsPage={onGoDetailsPage}
          />
        </Marquee>
      </Show>
    </>
  );
});

export default SliderSection;
