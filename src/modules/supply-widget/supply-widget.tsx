'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { Button, Collapse, Flex, Grid, Show, Text } from '@chakra-ui/react';

import AfterTransaction from '@/modules/supply-widget/after-transaction/after-transaction';
import Exchange from '@/modules/supply-widget/exchange/exchange';
import Loader from '@/modules/widget/loader/loader';
import { CircleIcon, NotSuccessfulIcon, SuccessfulIcon } from '@/shared/chakra-ui/icons';

import { useStore } from './store';

const SupplyWidget = () => {
  const { currentNetwork, showStep, setShowStep } = useStore();

  const { disconnect } = useDisconnect();

  const { switchChain } = useSwitchChain();

  const { isConnected, chainId } = useAccount();

  const [transactionEnd, setTransactionEnd] = useState(false);

  const [submittedTransaction, setSubmittedTransaction] = useState(false);

  const onMoveConnectWallet = () => {
    disconnect();
  };

  useEffect(() => {
    if (chainId && isConnected && !!currentNetwork) {
      if (chainId !== currentNetwork) {
        switchChain({ chainId: currentNetwork });

        if (showStep !== 1) {
          setShowStep(1);
        }
      } else {
        if (showStep !== 2) {
          setShowStep(2);
        }
      }
    }
  }, [chainId, isConnected, currentNetwork]);

  const isRightConnectedWallet = useMemo(() => {
    if (chainId && isConnected && !!currentNetwork) {
      return chainId === currentNetwork;
    }

    return false;
  }, [chainId, isConnected, currentNetwork]);

  const SupplyWidgetBlocks = (
    <>
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
            if (isRightConnectedWallet && showStep !== 3) {
              setShowStep(2);
            }
          }}
        >
          <Flex
            justifyContent='space-between'
            w='100%'
          >
            <Text
              color='#fff'
              size='medium18500120'
              opacity={showStep >= 2 ? 1 : 0.5}
            >
              2 - Select amount to Lend
            </Text>

            {transactionEnd ? (
              <SuccessfulIcon
                w='24px'
                h='24px'
              />
            ) : (
              <CircleIcon
                w='24px'
                h='24px'
                opacity={showStep === 2 ? 1 : 0.5}
              />
            )}
          </Flex>
        </Button>

        <Collapse in={showStep === 2}>
          <Exchange
            moveConnectWallet={onMoveConnectWallet}
            showPrevStep={() => {
              setTransactionEnd(false);
              setShowStep(2);
            }}
            showNextStep={() => {
              setTransactionEnd(true);
              setSubmittedTransaction(false);
              setShowStep(3);
            }}
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
              color='#fff'
              size='medium18500120'
              opacity={showStep === 3 ? 1 : 0.5}
            >
              3 - Submit Transaction
            </Text>
            {submittedTransaction && showStep === 3 ? (
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

        <Collapse
          in={showStep === 3}
          unmountOnExit
        >
          <AfterTransaction
            onLandMore={() => {
              setTransactionEnd(false);
              setShowStep(2);
            }}
            submittedTransaction={() => setSubmittedTransaction(true)}
          />
        </Collapse>
      </Flex>
    </>
  );
  return (
    <>
      <Show breakpoint='(min-width: 1250px)'>
        <Grid
          gridTemplateColumns='1fr'
          maxW='470px'
          m='0 auto'
          w='100%'
          border='1px solid'
          borderColor='rgba(255,255,255,0.08)'
          borderRadius='22px'
          overflow='hidden'
        >
          {SupplyWidgetBlocks}
        </Grid>
      </Show>

      <Show breakpoint='(max-width: 1250px)'>
        <Flex flexDirection='column'>{SupplyWidgetBlocks}</Flex>
      </Show>
    </>
  );
};

export default SupplyWidget;
