'use client';

import React, { memo } from 'react';
import { Button } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

import { useStore } from '@/modules/supply-widget/store';
import { contractsConfig, NetworksNames } from '@/shared/web3/chainConfig';
import { TableData } from '@/shared/web3/types';

interface LendButtonProps extends HTMLChakraProps<'button'> {
  textButton: string;

  marketData: TableData;

  variant?: string;

  onClick?: () => void;
}

const LendButton = memo(
  ({ textButton, marketData, variant = 'tableButtons', onClick, ...styles }: LendButtonProps) => {
    const {
      setCurrentNetwork,
      setTokenName,
      setCurrentTokenData,
      setNetworkName,
      setSelectedMarketData,
    } = useStore();

    const onLendButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();

      onClick?.();

      setSelectedMarketData(marketData);

      setCurrentNetwork(marketData.chainId);

      setTokenName(marketData.asset);

      setCurrentTokenData(contractsConfig.token[marketData.chainId][marketData.asset]);

      setNetworkName(NetworksNames[marketData.chainId]);
    };

    return (
      <Button
        variant={variant}
        {...styles}
        onClick={onLendButton}
      >
        {textButton}
      </Button>
    );
  }
);

export default LendButton;
