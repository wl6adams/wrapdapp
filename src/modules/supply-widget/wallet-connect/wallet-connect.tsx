import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button, Flex, Grid, Text } from '@chakra-ui/react';

import { useStore } from '@/modules/supply-widget/store';
import { GAEvent } from '@/shared/lib/gtag';
import { FallbackImage } from '@/shared/ui/fallback-image';

const WalletConnect = () => {
  const { currentNetwork, setShowStep, tokenName } = useStore();

  const { isConnected, chainId, address } = useAccount();

  const { disconnectAsync } = useDisconnect();

  const { connectAsync, connect, connectors, isError } = useConnect();

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (address) {
      GAEvent('on connect', 'event', `${address}_${currentNetwork}_${tokenName}`);
    }
  }, [address]);

  return (
    <Grid
      gridTemplateColumns='1fr'
      rowGap='8px'
      w='100%'
      p={{ base: '0 12px', sm: '0 24px' }}
      m='16px 0'
      bgRepeat='repeat'
      bgSize='cover'
    >
      {isError ? (
        <Grid
          gridTemplateColumns='1fr'
          textAlign='center'
          bg='#2B0D05'
          p='16px'
          border='1px solid'
          borderColor='#AF6356'
          borderRadius='8px'
          rowGap='8px'
          justifyContent='center'
        >
          <Text
            size='small14500140'
            opacity='0.5'
          >
            Unable to connect wallet
          </Text>

          <Text size='medium16400140'>Please refresh the page and try again</Text>

          <Button
            onClick={() => location.reload()}
            m='8px auto 0 '
            variant='maxButtons'
          >
            Refresh
          </Button>
        </Grid>
      ) : (
        connectors?.map((data, index) => (
          <Button
            variant='walletButtons'
            onClick={() => {
              if (isConnected) {
                if (chainId === currentNetwork) {
                  disconnectAsync().then(() =>
                    connectAsync({ connector: data }).then(() => setShowStep(2))
                  );

                  return;
                }
                switchChain({ chainId: currentNetwork, connector: data });
                return;
              }
              GAEvent('connect_wallet', 'event', data.name);
              connect({ connector: data });
            }}
            key={`walllet_${index}`}
          >
            <Flex
              justifyContent='space-between'
              alignItems='center'
              w='100%'
            >
              <Text
                size='medium16500140'
                color='#fff'
              >
                {data.name}
              </Text>

              <FallbackImage
                width={32}
                height={32}
                src={`/wallet/${data.name}.svg`}
                alt={data.name}
              />
            </Flex>
          </Button>
        ))
      )}
    </Grid>
  );
};

export default WalletConnect;
