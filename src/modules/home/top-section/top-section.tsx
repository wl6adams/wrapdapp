'use client';

import React, { memo } from 'react';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Grid, Text } from '@chakra-ui/react';

const TopSection = memo(() => {
  const [isLessThan800] = useMediaQuery('(max-width: 800px)');

  return (
    <Grid
      justifyItems='center'
      p='0'
      position='relative'
    >
      <video
        muted
        loop
        autoPlay
        playsInline
        controls={false}
        style={{
          height: isLessThan800 ? 'auto' : '500px',
          opacity: isLessThan800 ? 0.5 : 0.7,
          transform: `rotate(${isLessThan800 ? 359 : 353}deg) scale(${isLessThan800 ? 1.5 : 2.3})`,
          pointerEvents: 'none',
        }}
      >
        <source
          src='/circles.mp4'
          type='video/mp4'
        />
      </video>

      <Text
        position='absolute'
        top={{ base: '50%', lg: '30%' }}
        left='50%'
        transform='translate(-50%, -50%)'
        w={{ base: '360px', lg: '800px' }}
        textAlign='center'
        bg='brand.linearGradient.25'
        sx={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        fontSize={{ base: '52px', lg: '70px' }}
        fontWeight='700'
        lineHeight={{ base: '52px', lg: '70px' }}
      >
        Lend and Borrow with Compound
      </Text>
    </Grid>
  );
});

export default TopSection;
