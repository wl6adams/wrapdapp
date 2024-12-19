import React, { memo } from 'react';
import { useStore } from 'src/store';
import { Button } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

import { TableData } from '@/shared/web3/types';

interface BorrowButtonProps extends HTMLChakraProps<'button'> {
  textButton: string;

  marketData: TableData;

  variant?: string;

  onClick?: () => void;
}

const BorrowButton = memo(
  ({ variant = 'tableButtons', textButton, marketData, onClick, ...styles }: BorrowButtonProps) => {
    const { setShowStep, setSelectedMarketData } = useStore();

    const onChangeUserPosition = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();

      onClick?.();

      setSelectedMarketData(marketData);

      setShowStep(1);
    };

    return (
      <Button
        variant={variant}
        {...styles}
        onClick={onChangeUserPosition}
      >
        {textButton}
      </Button>
    );
  }
);

export default BorrowButton;
