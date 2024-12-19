import React from 'react';
import Image from 'next/image';
import { Button, Flex, Grid, Link as LinkRedirect, Text } from '@chakra-ui/react';

import AprSection from '@/modules/home/apr-section/apr-section';
import SliderSection from '@/modules/home/slider-section/slider-section';
import StartEarning from '@/modules/home/start-earning/start-earning';
import TopSection from '@/modules/home/top-section/top-section';
import { Page } from '@/widgets/page/ui';

export default function Home() {
  return (
    <Page
      padding='0'
      maxW='100%'
      overflowX='hidden'
    >
      <TopSection />

      <SliderSection />

      <AprSection />

      <StartEarning />

      <Flex
        m={{ base: '40px 0', lg: '60px 0' }}
        justifyContent='center'
      >
        <Grid
          w='100%'
          maxW='1200px'
          gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
          m={{ base: '0 16px', lg: '0' }}
          gap={{ base: '1.5rem', lg: '20px' }}
          p={{ base: '1.5rem 12px 12px', lg: '40px 60px' }}
          bg='brand.750'
          border='1px solid'
          borderColor='brand.1475'
          borderRadius='2rem'
        >
          <Flex
            gap='10px'
            p={{ base: '0', lg: '4rem' }}
            flexDirection='column'
            justifyContent='center'
            alignItems={{ base: 'center', lg: 'flex-start' }}
          >
            <Text
              textAlign={{ base: 'center', lg: 'initial' }}
              size='4070048'
              bg='brand.linearGradient.25'
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Audited and Verified
            </Text>

            <Text
              size='2450024'
              color='brand.550'
              textAlign={{ base: 'center', lg: 'initial' }}
            >
              Secure and Reliable: The Leading Protocol for Your Money
            </Text>

            <LinkRedirect
              href='https://docs.compound.finance/#security '
              target='_blank'
            >
              <Button
                bg='brand.550'
                fontSize='16'
                fontWeight='500'
                mt='14px'
              >
                Protocol Security
              </Button>
            </LinkRedirect>
          </Flex>

          <Grid
            p='10px'
            gap='10px'
            border='1px solid'
            borderColor='brand.1475'
            borderRadius='2rem'
          >
            <Flex
              h='100px'
              alignItems='center'
              justifyContent='center'
              bg='#FFFFFF0D'
              border='1px solid'
              borderColor='brand.600'
              borderRadius='1.5rem'
            >
              <Image
                width={48}
                height={57}
                src='/audited-verified/gauntlet.svg'
                alt='certora'
              />
            </Flex>

            <Flex
              h='100px'
              alignItems='center'
              justifyContent='center'
              bg='#FFFFFF0D'
              border='1px solid'
              borderColor='brand.600'
              borderRadius='1.5rem'
            >
              <Image
                width={92}
                height={56}
                src='/audited-verified/logo-trail-of-bits.svg'
                alt='certora'
              />
            </Flex>

            <Flex
              h='100px'
              alignItems='center'
              justifyContent='center'
              bg='#FFFFFF0D'
              border='1px solid'
              borderColor='brand.600'
              borderRadius='1.5rem'
            >
              <Image
                width={142}
                height={44}
                src='/audited-verified/certora.svg'
                alt='certora'
              />
            </Flex>

            <Flex
              h='100px'
              alignItems='center'
              justifyContent='center'
              bg='#FFFFFF0D'
              border='1px solid'
              borderColor='brand.600'
              borderRadius='1.5rem'
            >
              <Image
                width={170}
                height={28}
                src='/audited-verified/oz-logo.svg'
                alt='certora'
              />
            </Flex>
          </Grid>
        </Grid>
      </Flex>
    </Page>
  );
}
