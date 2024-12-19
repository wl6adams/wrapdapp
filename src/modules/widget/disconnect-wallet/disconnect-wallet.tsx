import { useState } from 'react';
import Image from 'next/image';
import { useStore } from 'src/store';
import { useAccount } from 'wagmi';
import { Button, Flex, Grid, Text } from '@chakra-ui/react';

import CollapsedWalletInfo from '@/modules/widget/collapsed-wallet-info/collapsed-wallet-info';
import { NetworksNames } from '@/shared/web3/config';

const DisconnectWallet = ({
  moveConnectWallet,
  isDisabled,
}: {
  moveConnectWallet: () => void;
  isDisabled: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { selectedMarketData } = useStore();

  const { isConnected, address } = useAccount();

  return selectedMarketData ? (
    <Grid
      gridTemplateColumns='repeat(2, 1fr)'
      columnGap={{ base: '8px', sm: '16px' }}
      p={isOpen ? '16px 10px' : '7px 5px'}
      borderRadius={isOpen ? '20px' : '40px'}
      border='1px solid'
      borderColor='rgba(255,255,255,0.15)'
      bg='rgba(255,255,255,0.05)'
    >
      <Grid
        gridTemplateColumns={{ base: '36px 1fr 1fr', sm: '36px 1fr 1fr' }}
        columnGap={{ base: '4px', sm: '8px' }}
        borderRadius='1000px'
        p={{ base: '4px 8px 4px 4px', sm: '12px 20px 12px 10px' }}
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
            src={`/collaterals/${selectedMarketData.asset}.svg`}
            alt={selectedMarketData.asset}
          />

          <Image
            width={22}
            height={22}
            style={{ position: 'absolute', left: '14px' }}
            loading='lazy'
            src={`/markets/${NetworksNames[selectedMarketData.chainId].toLowerCase()}.svg`}
            alt={selectedMarketData.asset}
          />
        </Flex>

        <Text size='small16600110'>{selectedMarketData.asset}</Text>

        <Text
          color='#80838E'
          size='small16600110'
        >
          {NetworksNames[selectedMarketData.chainId]}
        </Text>
      </Grid>

      {isConnected && address ? (
        <CollapsedWalletInfo
          moveConnectWallet={moveConnectWallet}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
        />
      ) : (
        <Button
          onClick={moveConnectWallet}
          variant='actionButtons'
        >
          Connect Wallet
        </Button>
      )}
    </Grid>
  ) : null;
};

export default DisconnectWallet;
