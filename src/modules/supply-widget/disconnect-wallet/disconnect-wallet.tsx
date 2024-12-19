import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { Box, Button, Collapse, Flex, Grid, Text } from '@chakra-ui/react';

import { useStore } from '@/modules/supply-widget/store';
import { DisconnectButton, WithdrawIcon } from '@/shared/chakra-ui/icons';
import { sliceAddress } from '@/shared/lib/utils';

interface DisconnectWalletProps {
  isDisabled: boolean;

  moveConnectWallet: () => void;
}

const DisconnectWallet = ({ moveConnectWallet, isDisabled }: DisconnectWalletProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { networkName, tokenName, currentTokenData, showStep } = useStore();

  const { isConnected, address, connector } = useAccount();

  const { refetch: refetchUserEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
  });

  const { refetch: refetchTokenBalance } = useBalance({
    address: address,
    token: currentTokenData.addressFrom,
    blockTag: 'latest',
  });

  const onChangeWallet = () => {
    setIsOpen(false);

    moveConnectWallet();
  };

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
        gridTemplateColumns='repeat(2, 1fr)'
        columnGap={{ base: '8px', sm: '0px' }}
        p={isOpen ? '16px 10px' : '7px 10px'}
        borderRadius={isOpen ? '20px' : '40px'}
        border='1px solid'
        borderColor='rgba(255,255,255,0.15)'
        bg='rgba(255,255,255,0.05)'
      >
        <Grid
          gridTemplateColumns={{ base: '36px 1fr 1fr', sm: '36px 1fr 1fr' }}
          columnGap={{ base: '4px', sm: '6px' }}
          borderRadius='1000px'
          p={{ base: '4px 8px 4px 4px', sm: '12px 20px 12px 6px' }}
          opacity={isDisabled ? 0.5 : 1}
          alignItems='center'
        >
          <Flex
            alignItems='center'
            position='relative'
          >
            <Image
              width={22}
              height={22}
              loading='lazy'
              src={`/collaterals/${tokenName}.svg`}
              alt={tokenName}
            />

            <Image
              width={22}
              height={22}
              style={{ position: 'absolute', left: '14px' }}
              loading='lazy'
              src={`/markets/${networkName.toLowerCase()}.svg`}
              alt={networkName}
            />
          </Flex>

          <Text size='small16600110'>{tokenName}</Text>

          <Text
            color='#80838E'
            size='small16600110'
          >
            {networkName}
          </Text>
        </Grid>

        {isConnected && address ? (
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

              <Text size='small14600110'>{sliceAddress(address)}</Text>

              <WithdrawIcon
                transition='all .3s'
                transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                w={{ base: '13px', sm: '17px' }}
                h={{ base: '12px', sm: '16px' }}
              />
            </Grid>
            <Box gridArea='2 / span 2'>
              <Collapse
                endingHeight='85px'
                transition={{
                  exit: { ease: 'linear', duration: 0.4 },
                  enter: { ease: 'linear', duration: 0.4 },
                }}
                in={isOpen}
              >
                <Grid
                  gridTemplateColumns='repeat(2, 1fr)'
                  p='16px'
                  mt='20px'
                  borderRadius='8px'
                  boxShadow='0 4px 4px 0 rgba(0, 0, 0, 0.1)'
                  bg='rgba(255,255,255,0.05)'
                  bgSize='cover'
                  bgPosition='center'
                  rowGap='16px'
                >
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

                  <Button
                    justifySelf='flex-end'
                    w='120px'
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
        ) : (
          <Button
            onClick={moveConnectWallet}
            variant='actionButtons'
          >
            Connect Wallet
          </Button>
        )}
      </Grid>
    </>
  );
};

export default DisconnectWallet;
