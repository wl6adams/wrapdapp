import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from 'src/store';
import { useAccount, useSwitchChain } from 'wagmi';
import { Button, Collapse, Flex, Text } from '@chakra-ui/react';

import AmountToBorrow from '@/modules/widget/amount-to-borrow/amount-to-borrow';
import Collateral from '@/modules/widget/collateral/collateral';
import Loader from '@/modules/widget/loader/loader';
import SubmitTransaction from '@/modules/widget/submit-transaction/submit-transaction';
import { CircleIcon, NotSuccessfulIcon, SuccessfulIcon } from '@/shared/chakra-ui/icons';

const Widget = ({
  openWalletConnect,
  afterTransaction,
}: {
  openWalletConnect: () => void;
  afterTransaction?: () => void;
}) => {
  const {
    showStep,
    setShowStep,
    inputValue,
    selectedMarketData,
    isAfterApprove,
    isLoadingTransaction,
  } = useStore();

  const { switchChain } = useSwitchChain();

  const { isConnected, chainId } = useAccount();

  const [isRightConnectedWallet, setIsRightConnectedWallet] = useState<boolean>(false);

  useEffect(() => {
    if (chainId && isConnected && selectedMarketData) {
      if (chainId !== selectedMarketData.chainId) {
        switchChain({ chainId: selectedMarketData.chainId });

        setShowStep(1);

        setIsRightConnectedWallet(false);
      } else {
        setShowStep(2);

        setIsRightConnectedWallet(true);
      }
    }
  }, [chainId, isConnected, selectedMarketData, switchChain]);

  const isAmountMoreThatMin = useMemo(() => {
    return (selectedMarketData?.minBorrow || 0) < Number(inputValue || '0');
  }, [selectedMarketData, inputValue]);

  return (
    <Flex
      flexDirection='column'
      maxW='450px'
      w='100%'
      bg='brand.1100'
      border='1px solid'
      borderColor='rgba(255,255,255,0.08)'
      borderRadius='22px'
    >
      <Flex flexDirection='column'>
        <Button variant='collapseButtons'>
          <Flex
            justifyContent='space-between'
            w='100%'
          >
            <Text
              color='#fff'
              size='medium18500120'
              opacity={showStep === 1 || isRightConnectedWallet ? 1 : 0.5}
            >
              1 - Connect Wallet
            </Text>

            {isRightConnectedWallet ? (
              <SuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : showStep !== 1 ? (
              <NotSuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : (
              <CircleIcon
                w='24px'
                h='24px'
                opacity={showStep === 1 ? 1 : 0.5}
              />
            )}
          </Flex>
        </Button>

        <Collapse in={showStep === 1}>
          <Loader h='100px' />
        </Collapse>
      </Flex>

      <Flex flexDirection='column'>
        <Button
          variant='collapseButtons'
          onClick={() => {
            if (isRightConnectedWallet && showStep !== 1) {
              setShowStep(2);
            }
          }}
        >
          <Flex
            justifyContent='space-between'
            w='100%'
          >
            <Text
              color='brand.50'
              size='medium18500120'
              opacity={showStep >= 2 ? 1 : 0.5}
            >
              2 - Select Amount to Borrow
            </Text>

            {showStep > 2 && inputValue !== '' ? (
              <SuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : showStep <= 2 ? (
              <CircleIcon
                w='24px'
                h='24px'
                opacity={showStep === 2 ? 1 : 0.5}
              />
            ) : (
              <NotSuccessfulIcon
                w='24px'
                h='24px'
              />
            )}
          </Flex>
        </Button>

        <Collapse in={showStep === 2}>
          <AmountToBorrow openWalletConnect={openWalletConnect} />
        </Collapse>
      </Flex>

      <Flex flexDirection='column'>
        <Button
          variant='collapseButtons'
          onClick={() => {
            if (isAmountMoreThatMin) {
              setShowStep(3);
            }
          }}
        >
          <Flex
            justifyContent='space-between'
            w='100%'
          >
            <Text
              color='brand.50'
              size='medium18500120'
              opacity={showStep >= 3 ? 1 : 0.5}
            >
              3 - Select Collateral to Supply
            </Text>

            {showStep > 3 && !isAfterApprove ? (
              <SuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : (
              <CircleIcon
                w='24px'
                h='24px'
                opacity={showStep === 3 ? 1 : 0.5}
              />
            )}
          </Flex>
        </Button>

        <Collapse in={showStep === 3}>
          <Collateral
            openWalletConnect={openWalletConnect}
            afterTransaction={afterTransaction}
            key={inputValue}
          />
        </Collapse>
      </Flex>

      <Flex flexDirection='column'>
        <Button
          variant='collapseButtons'
          borderBottom='none'
        >
          <Flex
            justifyContent='space-between'
            w='100%'
          >
            <Text
              color='brand.50'
              size='medium18500120'
              opacity={showStep === 4 ? 1 : 0.5}
            >
              4 - Submit Transaction
            </Text>
            {showStep === 4 && !isLoadingTransaction ? (
              <SuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : (
              <CircleIcon
                w='24px'
                h='24px'
                opacity={showStep === 4 ? 1 : 0.5}
              />
            )}
          </Flex>
        </Button>

        <Collapse
          in={showStep === 4}
          unmountOnExit
        >
          <SubmitTransaction />
        </Collapse>
      </Flex>
    </Flex>
  );
};

export default Widget;
