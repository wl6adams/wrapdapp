import Image from 'next/image';
import { Box, Container, Flex, Grid, Text } from '@chakra-ui/react';

import { Link } from '@/shared/ui/link';

function Footer() {
  return (
    <>
      <Box
        zIndex={1}
        top={0}
        padding='40px 0'
        as='footer'
      >
        <Container
          padding='16px'
          flexFlow='wrap'
          color='brand.baseText'
          alignItems='center'
          display='flex'
          justifyContent='space-between'
          maxW={1200}
        >
          <Grid
            gridTemplateColumns={{ base: '1fr', md: '3fr 1fr' }}
            gap='24px'
            mb='60px'
            w='100%'
          >
            <Grid
              gridTemplateColumns='1fr'
              gap='34px'
              maxW='258px'
              justifySelf={{ base: 'center', md: 'flex-start' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              <Link href='/'>
                <Image
                  width={180}
                  height={40}
                  src='/compound-logo-footer.svg'
                  alt='compound-logo-footer'
                />
              </Link>

              <Flex
                gap='1.5rem'
                justifyContent={{ base: 'center', lg: 'initial' }}
              >
                <Link
                  href='https://x.com/compoundfinance'
                  target='_blank'
                >
                  <Image
                    width={24}
                    height={24}
                    src='/social/x-twitter.svg'
                    alt='x-twitter'
                  />
                </Link>

                <Link
                  href='https://discord.com/channels/402910780124561410/402910780670083094'
                  target='_blank'
                >
                  <Image
                    width={24}
                    height={24}
                    src='/social/discord.svg'
                    alt='discord'
                  />
                </Link>

                <Link
                  href='https://x.com/growcompound'
                  target='_blank'
                >
                  <Image
                    width={24}
                    height={24}
                    src='/social/x-twitter.svg'
                    alt='x-twitter'
                  />
                </Link>
              </Flex>

              <Grid gap='10px'>
                <Link
                  href='https://compound.education/'
                  target='_blank'
                >
                  Compound Academy
                </Link>

                <Link
                  href='https://discord.com/channels/402910780124561410/765610989847969810'
                  target='_blank'
                >
                  Support
                </Link>
              </Grid>
            </Grid>

            <Grid
              gap={{ base: '1.5rem 70px', lg: '80px' }}
              gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            >
              <Flex
                w='max-content'
                flexDirection='column'
                gap='10px'
                color='brand.250'
                justifySelf={{ base: 'center', md: 'flex-start' }}
              >
                <Text
                  size='large20700160'
                  color='brand.50'
                  mb='10px'
                >
                  Compound II
                </Text>

                <Link
                  href='https://v2-app.compound.finance/'
                  target='_blank'
                >
                  App
                </Link>

                <Link
                  href='https://app.compound.finance/markets/v2'
                  target='_blank'
                >
                  Markets
                </Link>

                <Link
                  href='https://docs.compound.finance/v2/'
                  target='_blank'
                >
                  Documentation
                </Link>

                <Link
                  href='https://docs.compound.finance/v2/security/'
                  target='_blank'
                >
                  Security
                </Link>
              </Flex>

              <Flex
                w='max-content'
                flexDirection='column'
                gap='10px'
                color='brand.250'
                justifySelf={{ base: 'center', md: 'flex-start' }}
              >
                <Text
                  size='large20700160'
                  color='brand.50'
                  mb='10px'
                >
                  Compound III
                </Text>

                <Link href='/dashboard'>App</Link>

                <Link href='/market'>Markets</Link>

                <Link
                  href='https://docs.compound.finance/'
                  target='_blank'
                >
                  Documentation
                </Link>

                <Link
                  href='https://docs.compound.finance/#security'
                  target='_blank'
                >
                  Security
                </Link>
              </Flex>

              <Flex
                w='max-content'
                flexDirection='column'
                gap='10px'
                color='brand.250'
                justifySelf={{ base: 'center', md: 'flex-start' }}
              >
                <Text
                  size='large20700160'
                  color='brand.50'
                  mb='10px'
                >
                  Governance
                </Text>

                <Link
                  href='https://compound.finance/governance'
                  target='_blank'
                >
                  Dashboard
                </Link>

                <Link
                  href='https://compound.finance/governance/proposals'
                  target='_blank'
                >
                  Proposals
                </Link>

                <Link
                  href='https://www.comp.xyz/'
                  target='_blank'
                >
                  Forums
                </Link>

                <Link
                  href='https://www.tally.xyz/gov/compound/delegates'
                  target='_blank'
                >
                  Leaderboard
                </Link>
              </Flex>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default Footer;
