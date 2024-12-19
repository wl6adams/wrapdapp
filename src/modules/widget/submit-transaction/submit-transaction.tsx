import React, { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from 'src/store';
import { useAccount } from 'wagmi';
import { Link } from '@chakra-ui/next-js';
import { Box, Button, Flex, Grid, Text } from '@chakra-ui/react';

import Loader from '@/modules/widget/loader/loader';
import { useMixpanelAnalytics } from '@/shared/hooks/useMixpanelAnalytics';
import { Divider } from '@/shared/ui/divider';
import { CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';

const SubmitTransaction = () => {
  const { mixpanelTrackEvent } = useMixpanelAnalytics();

  const { isLoadingTransaction, setShowStep, inputValue, liqRisk, txHash, selectedMarketData } =
    useStore();

  const { chainId } = useAccount();

  const onBorrowMore = () => setShowStep(3);

  useEffect(() => {
    if (!isLoadingTransaction) {
      mixpanelTrackEvent('Conversion', {
        transaction_id: txHash,
        chain_id: chainId,
        source: 'Internal Test',
        element: 'Borrow Modal',
      });
    }
  }, [isLoadingTransaction]);

  return (
    <Grid
      border='1px solid'
      borderColor='#2e2e2e'
      p='52px 24px'
      rowGap='24px'
      backgroundSize='cover'
      bgPosition='center'
    >
      {isLoadingTransaction ? (
        <Loader />
      ) : (
        <>
          <Flex
            m='0 auto'
            border='8px solid'
            borderColor='rgba(255, 255, 255, 0.05)'
            borderRadius='500px'
            width='64px'
            height='64px'
            backdropFilter='blur(12px)'
            bg='rgba(255, 255, 255, 0.1)'
            justifyContent='center'
            alignItems='center'
          >
            <Image
              width={32}
              height={23}
              src='/approve.svg'
              alt='approve'
            />
          </Flex>

          <Text
            textAlign='center'
            size='large24700120'
          >
            Transaction Successful
          </Text>

          <Grid
            alignItems='center'
            gridTemplateColumns='1fr 1fr'
            gap='8px'
            border='1px solid'
            borderColor='rgba(255, 255, 255, 0.15)'
            borderRadius='8px'
            p='16px'
          >
            <Text
              size='small14500140'
              color='rgba(255, 255, 255, 0.5)'
            >
              Borrowed
            </Text>

            <Flex
              alignItems='center'
              columnGap='8px'
              gridArea='2/ 1'
            >
              <Image
                width={24}
                height={24}
                src={`/collaterals/${selectedMarketData?.asset}.svg`}
                alt={selectedMarketData?.asset || 'market_image'}
              />

              <Text size='large24600110'>{inputValue}</Text>
            </Flex>

            <Box
              gridArea='span 2 /  2'
              borderRadius='100px'
              p='9px 20px'
              backdropFilter='blur(5px)'
              bg='rgba(255, 255, 255, 0.15)'
              textAlign='center'
            >
              <Text size='large12500140'>Health Factor {liqRisk.toFixed(1)}</Text>
            </Box>
          </Grid>

          <Box
            w='100%'
            m='10px 0'
          >
            <Divider maxW={400} />
          </Box>

          <Button
            variant='actionButtons'
            onClick={onBorrowMore}
          >
            Borrow More
          </Button>

          <Link
            href={`${CurrentNetworkExplorerURL[chainId || DEFAULT_CHAIN_ID]}/tx/${txHash}`}
            target='_blank'
            textAlign='center'
            textDecoration='none'
            color='#00D395'
          >
            View Transaction
          </Link>
        </>
      )}
    </Grid>
  );
};

export default SubmitTransaction;
