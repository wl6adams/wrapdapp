import React, { FC, useState } from 'react';
import Image from 'next/image';
import { Box, Collapse, Flex, Grid, Text, useDisclosure } from '@chakra-ui/react';

import { BorrowModal } from '@/modules/borrow/modal/modal';
import RepayWidget from '@/modules/dashboard/repay-widget/repay-widget';
import BorrowButton from '@/modules/market/borrow-button/borrow-button';
import { formatSliceTokenOrUSD } from '@/shared/lib/utils';
import { NetworksNames } from '@/shared/web3/config';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';

interface PositionCardProps {
  data: TableData;
  debt: number;
  bpu: string;
  index: number;
  selectedPosition: number;

  onSelectedPosition: () => void;
  getBorrowPos: () => void;
}

const PositionCard: FC<PositionCardProps> = ({
  data,
  debt,
  bpu,
  selectedPosition,
  index,
  onSelectedPosition,
  getBorrowPos,
}) => {
  const {
    isOpen: isBorrowModalOpen,
    onOpen: onBorrowModalOpen,
    onClose: onBorrowModalClose,
  } = useDisclosure();

  const { selectedMarketData } = useStore();

  const [openModal, setOpenModal] = useState(false);

  const onCloseModal = () => {
    setOpenModal(false);
  };

  const onOpenModal = () => {
    setOpenModal(true);
  };

  const debtPrice = debt * data.price;

  return (
    <Grid
      bg={selectedPosition === index ? 'brand.400' : 'brand.1100'}
      onClick={onSelectedPosition}
      p='16px'
      borderRadius='8px'
      border={selectedPosition === index ? '0.5px solid' : 'none'}
      borderColor='brand.100'
      gap='8px'
      cursor='pointer'
    >
      <Grid gridTemplateColumns='24px 24px 1fr'>
        <Image
          width={24}
          height={24}
          loading='lazy'
          src={`/collaterals/${data.asset}.svg`}
          alt={data.asset}
        />

        <Image
          width={24}
          height={24}
          style={{ position: 'relative', left: '-8px' }}
          loading='lazy'
          src={`/markets/${NetworksNames[data.chainId].toLowerCase()}.svg`}
          alt={NetworksNames[data.chainId]}
        />

        <Text
          size='medium18500120'
          letterSpacing='0.02em'
        >
          {data.asset}/{NetworksNames[data.chainId]}
        </Text>
      </Grid>

      <Flex
        flexWrap='wrap'
        alignItems='center'
        gap='8px'
      >
        <Flex
          borderRadius='4px'
          p='4px 8px'
          gap='8px'
          border='1px solid'
          borderColor='brand.600'
        >
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
            color='brand.650'
          >
            Debt:
          </Text>
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
          >
            {debtPrice > 1 ? (
              <>
                {formatSliceTokenOrUSD(debt.toString(), 5)}
                ($
                {formatSliceTokenOrUSD(debtPrice.toString())})
              </>
            ) : (
              '0($0.00)'
            )}
          </Text>
        </Flex>

        <Flex
          borderRadius='4px'
          p='4px 8px'
          gap='8px'
          border='1px solid'
          borderColor='brand.600'
        >
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
            color='brand.650'
          >
            APR:
          </Text>
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
          >
            {data.netBorrowAPY.toFixed(2)}%
          </Text>
        </Flex>

        <Flex
          borderRadius='4px'
          p='4px 8px'
          gap='8px'
          border='1px solid'
          borderColor='brand.600'
        >
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
            color='brand.650'
          >
            Borrow Power Used:
          </Text>
          <Text
            size='medium18500120'
            letterSpacing='0.02em'
          >
            {bpu} %
          </Text>
        </Flex>
      </Flex>

      <Box
        m={{ base: '2px 0', md: '8px 0' }}
        w='100%'
        h='1px'
        bg='brand.500'
      ></Box>

      <Collapse in={selectedPosition === index}>
        <Grid
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }}
          gap='8px'
        >
          <BorrowButton
            textButton='Borrow More'
            variant='withDrawButtons'
            marketData={data}
            onClick={onBorrowModalOpen}
          />

          {debtPrice < 1 && !openModal ? null : (
            <RepayWidget
              openModal={openModal}
              onCloseModal={onCloseModal}
              onOpenModal={onOpenModal}
              reGetData={getBorrowPos}
              marketData={data}
            />
          )}
        </Grid>
      </Collapse>

      <BorrowModal
        isOpen={isBorrowModalOpen}
        marketData={selectedMarketData!}
        onOpen={onBorrowModalOpen}
        onClose={onBorrowModalClose}
        onAfterTransaction={getBorrowPos}
      />
    </Grid>
  );
};

export { PositionCard };
