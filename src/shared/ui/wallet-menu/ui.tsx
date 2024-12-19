import { createRef, RefObject, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAccount, useDisconnect } from 'wagmi';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  Text,
  useClipboard,
  useDisclosure,
} from '@chakra-ui/react';

import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { sliceAddress } from '@/shared/lib/utils';

interface WalletMenuProps {
  connectWallet: () => void;

  onRPCOpen: () => void;
}

const WalletMenu = ({ connectWallet, onRPCOpen }: WalletMenuProps) => {
  const ref: RefObject<HTMLDivElement> = createRef();

  const { onCopy, setValue } = useClipboard('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { address, connector } = useAccount();

  const { disconnect } = useDisconnect();

  const walletIcon = useMemo(() => {
    switch (connector?.id) {
      case 'metaMaskSDK':
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

  const onDisconnect = () => {
    onClose();
    disconnect();
  };

  const changeWallet = () => {
    onClose();
    connectWallet();
  };

  useClickOutside(ref, onClose);

  useEffect(() => {
    if (address) {
      setValue(address);
    }
  }, [address]);

  return (
    <Flex
      position='relative'
      ref={ref}
    >
      <Flex
        alignItems='center'
        bg='brand.500'
        borderRadius='50px'
        p='10px 16px'
        columnGap='6px'
        key={address}
        onClick={!isOpen ? onOpen : onClose}
        cursor='pointer'
      >
        <Image
          width={20}
          height={20}
          alt='avatar'
          src={walletIcon}
        />

        <Text size='small14500120'>{sliceAddress(address)}</Text>
      </Flex>

      <Flex
        position='absolute'
        top='45px'
        right='0'
        bg='brand.750'
        borderRadius='0.75rem'
        border='1px solid'
        borderColor='brand.500'
      >
        <Collapse in={isOpen}>
          <Grid
            minW='270px'
            gridTemplateColumns='1fr'
            p='1rem'
            gap='1rem'
          >
            <Text
              size='large12500140'
              fontWeight='700'
              color='brand.300'
            >
              Connected Wallet
            </Text>

            <Flex
              alignItems='center'
              columnGap='6px'
              cursor='pointer'
            >
              <Box
                justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
                w='0.5rem'
                h='0.5rem'
                borderRadius='50%'
                bg='brand.100'
                flexShrink={0}
              />

              <Text size='small14500120'>{sliceAddress(address)}</Text>

              <Image
                width={16}
                height={16}
                src='/copy.svg'
                alt='copy'
                onClick={onCopy}
                style={{
                  marginLeft: 'auto',
                }}
              />
            </Flex>

            <Grid gap='0.5rem'>
              <Button
                variant='tableButtons'
                w='100%'
                onClick={onDisconnect}
              >
                Disconnect Wallet
              </Button>

              <Button
                variant='tableButtons'
                w='100%'
                onClick={changeWallet}
              >
                Change Wallet
              </Button>

              <Button
                variant='tableButtons'
                w='100%'
                onClick={onRPCOpen}
              >
                RPC Settings
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Flex>
    </Flex>
  );
};

export { WalletMenu };
