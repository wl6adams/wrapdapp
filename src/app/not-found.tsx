import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Flex, Grid, Text } from '@chakra-ui/react';

export default function NotFound() {
  return (
    <main>
      <Flex
        m={{ base: '40px 1rem 0', lg: '0 auto' }}
        p='108px 0'
        maxW='1240px'
        bg='brand.750'
        borderRadius='0.5rem'
        border='1px solid'
        borderColor='brand.400'
        justifyContent='center'
        flexDirection='column'
        alignItems='center'
      >
        <Grid
          gap='20px'
          justifyItems='center'
        >
          <Image
            width={135}
            height={135}
            src='/not-found.png'
            alt='not-found'
          />

          <Grid gap='0.5rem'>
            <Text
              textAlign='center'
              size='large24700120'
            >
              Oops!
            </Text>

            <Text size='medium16400140'>This Page doesn’t exist.</Text>
          </Grid>

          <Text
            fontSize='106px'
            bg='brand.linearGradient.25'
            sx={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            fontWeight='700'
            lineHeight='106px'
          >
            404
          </Text>
        </Grid>

        <Button
          mt='60px'
          h='2.7rem'
          color='brand.150'
        >
          <Link href='/'>Go Home</Link>
        </Button>
      </Flex>
    </main>
  );
}
