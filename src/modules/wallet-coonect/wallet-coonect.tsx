import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button, Flex, Grid, Text } from '@chakra-ui/react';

import { FallbackImage } from '@/shared/ui/fallback-image';

interface WalletConnectProps {
  closeModal?: () => void;

  onConnectedWallet?: (isConnected?: boolean) => void;
}

const WalletConnect = ({ closeModal, onConnectedWallet }: WalletConnectProps) => {
  const { isConnected, address } = useAccount();

  const { disconnectAsync } = useDisconnect();

  const { connectAsync, connectors } = useConnect();

  const wallets =
    window.innerWidth <= 800
      ? connectors.filter((connector) => connector.id === 'walletConnect')
      : connectors;

  return (
    <Grid>
      <Grid
        gridTemplateColumns='1fr'
        gap='24px'
        p='32px 24px'
        borderBottom='1px solid'
        borderColor='brand.400'
      >
        <Flex
          alignItems='center'
          justifyContent='center'
          columnGap='4px'
        >
          <FallbackImage
            width={24}
            height={24}
            src='/logo.svg'
            alt='logo'
          />
          <Text>Compound</Text>
        </Flex>

        <Text
          size='medium18500120'
          textAlign='center'
        >
          Connect Wallet to Proceed
        </Text>
      </Grid>

      <Grid
        gridTemplateColumns='1fr'
        rowGap='8px'
        w='100%'
        p='16px 24px'
      >
        {wallets?.map((data, index) => (
          <Button
            variant='walletButtons'
            onClick={() => {
              if (isConnected && address) {
                disconnectAsync().then(() => connectAsync({ connector: data }));

                closeModal?.();

                return;
              }

              connectAsync({ connector: data }).catch(() => onConnectedWallet?.());

              closeModal?.();

              onConnectedWallet?.(true);
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
                color='brand.50'
              >
                {data.name}
              </Text>

              <FallbackImage
                width={32}
                height={32}
                quality={80}
                src={`/wallet/${data.name}.svg`}
                alt={data.name}
              />
            </Flex>
          </Button>
        ))}
      </Grid>
    </Grid>
  );
};

export default WalletConnect;
