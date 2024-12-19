import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from 'src/store';
import { useAccount, useBalance } from 'wagmi';
import { Box, Button, Collapse, Flex, Grid, Text } from '@chakra-ui/react';

import { DisconnectButton, WithdrawIcon } from '@/shared/chakra-ui/icons';
import { sliceAddress } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';

const CollapsedWalletInfo = ({
  isOpen,
  setIsOpen,
  moveConnectWallet,
  short = false,
}: {
  short?: boolean;
  isOpen: boolean;
  moveConnectWallet: () => void;
  setIsOpen: (bool: boolean) => void;
}) => {
  const { showStep } = useStore();

  const { address, connector } = useAccount();

  const onChangeWallet = () => {
    moveConnectWallet();
    setIsOpen(false);
  };

  const { refetch: refetchUserEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
  });

  const { refetch: refetchTokenBalance } = useBalance({
    address: address,
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    blockTag: 'latest',
  });

  useEffect(() => {
    refetchUserEthBalance();

    refetchTokenBalance();
  }, [showStep]);

  const walletIcon = useMemo(() => {
    switch (connector?.id) {
      case 'metaMask':
        return '/wallet/MetaMask.svg';

      case 'okxDefi':
        return '/wallet/Okx Defi.svg';

      case 'walletConnect':
        return '/wallet/WalletConnect.svg';

      case 'coinbaseWalletSDK':
        return '/wallet/Coinbase Wallet.svg';

      case 'rabby':
        return '/wallet/Rabby Wallet.svg';

      default:
        return '/user.svg';
    }
  }, [connector]);

  return (
    <>
      <Grid
        gridTemplateColumns={{ base: '20px 1fr 13px', sm: '24px 1fr 17px' }}
        columnGap={{ base: '4px', sm: '8px' }}
        borderRadius='1000px'
        p={{ base: '4px 8px', sm: '12px 20px' }}
        bg='rgba(255,255,255,0.08)'
        alignItems='center'
        cursor='pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          width={20}
          height={20}
          src={walletIcon}
          alt='wallet'
        />

        <Text size='small16600110'>{sliceAddress(address)}</Text>

        <WithdrawIcon
          transition='all .3s'
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          w={{ base: '13px', sm: '17px' }}
          h={{ base: '12px', sm: '16px' }}
        />
      </Grid>

      <Box gridArea='2 / span 2'>
        <Collapse
          endingHeight={short ? '65px' : 'auto'}
          transition={{
            exit: { ease: 'linear', duration: 0.4 },
            enter: { ease: 'linear', duration: 0.4 },
          }}
          in={isOpen}
        >
          <Flex
            justifyContent='center'
            w='100%'
            m='10px 0 '
          >
            <Divider w={400} />
          </Flex>

          <Grid
            gridTemplateColumns={short ? '1fr' : 'repeat(2, 1fr)'}
            p={short ? '2px ' : '16px'}
            borderRadius='8px'
            boxShadow='0 4px 4px 0 rgba(0, 0, 0, 0.1)'
            bg='transparent'
            bgSize='cover'
            bgPosition='center'
            rowGap='16px'
          >
            {!short && (
              <Grid
                gridTemplateColumns='24px 1fr '
                columnGap='8px'
                borderRadius='1000px'
                alignItems='center'
                cursor='pointer'
                onClick={() => setIsOpen(!isOpen)}
              >
                <Image
                  width={20}
                  height={20}
                  src={walletIcon}
                  alt='wallet'
                />

                <Text size='small14600110'>{sliceAddress(address)}</Text>
              </Grid>
            )}

            <Button
              justifySelf='flex-end'
              w={short ? '100%' : '120px'}
              variant='maxButtons'
              onClick={() => onChangeWallet()}
            >
              <Flex
                alignItems='center'
                columnGap='4px'
              >
                <DisconnectButton
                  w='13px'
                  h='12px'
                />
                Change wallet
              </Flex>
            </Button>
          </Grid>
        </Collapse>
      </Box>
    </>
  );
};

export default CollapsedWalletInfo;
