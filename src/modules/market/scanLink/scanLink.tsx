'use client';

import Image from 'next/image';
import { Box, Flex, Grid, Show, Text } from '@chakra-ui/react';

import { CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';

const ScanLink = () => {
  const { selectedMarketData } = useStore();
  return (
    <Grid
      gap='0.5rem'
      p={{ base: '0', lg: '1rem 1.5rem 2rem' }}
      borderRadius='8px'
      bg={{ base: 'transparent', lg: 'brand.750' }}
    >
      <Text
        p={{ base: '0', lg: '10px 1rem' }}
        size={{
          base: 'medium18500120',
          lg: 'small12400120',
        }}
      >
        Additional Market Data
      </Text>

      <Show breakpoint='(min-width: 1250px)'>
        <Flex
          gap='10px'
          bg='brand.400'
          p='23.5px 1rem'
          borderRadius='8px'
          cursor='pointer'
          onClick={() =>
            window.open(
              `${CurrentNetworkExplorerURL[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}/address/${selectedMarketData?.cometAddress}`,
              '_blank'
            )
          }
        >
          <Text size='small14600110'>Etherscan</Text>

          <Image
            width={16}
            height={16}
            src='/link-scan.svg'
            alt='link-scan'
          />
        </Flex>
      </Show>

      <Show breakpoint='(max-width: 1249px)'>
        <Box
          p='1.5rem'
          bg='brand.750'
        >
          <Flex
            gap='10px'
            bg='brand.400'
            p='23.5px 1rem'
            borderRadius='8px'
            cursor='pointer'
            onClick={() =>
              window.open(
                `${CurrentNetworkExplorerURL[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]}/address/${selectedMarketData?.cometAddress}`,
                '_blank'
              )
            }
          >
            <Text size='small14600110'>Etherscan</Text>

            <Image
              width={16}
              height={16}
              src='/link-scan.svg'
              alt='link-scan'
            />
          </Flex>
        </Box>
      </Show>
    </Grid>
  );
};

export default ScanLink;
