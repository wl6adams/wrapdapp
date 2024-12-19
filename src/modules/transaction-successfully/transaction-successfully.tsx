import React, { FC } from 'react';
import { Box, Button, Flex, Image, Link, Text } from '@chakra-ui/react';

import { View } from '@/shared/ui/view';

interface TransactionSuccessfullyProps {
  href: string;

  isFullDebt?: boolean;

  isViewTransaction?: boolean;

  onLendMore?: () => void;
}

const TransactionSuccessfully: FC<TransactionSuccessfullyProps> = ({
  href,
  isFullDebt,
  isViewTransaction = true,
  onLendMore,
}) => (
  <Box p='2rem 1.5rem'>
    <Flex
      m='0 auto'
      width='5.25rem'
      height='5.25rem'
      justifyContent='center'
      alignItems='center'
    >
      <Image
        m='0 auto'
        src='/approve.svg'
        alt='approve'
      />
    </Flex>

    <Text
      mt='2rem'
      textAlign='center'
      size='large24700120'
    >
      Transaction Successfully Completed
    </Text>

    <View.Condition if={!!onLendMore}>
      <Button
        mt='4rem'
        variant='actionButtons'
        onClick={onLendMore}
      >
        Lend More
      </Button>
    </View.Condition>

    <View.Condition if={!!isFullDebt}>
      <Text
        textAlign='center'
        size='1870021'
        color='brand.100'
        m={`1.75rem 0 ${isViewTransaction ? '1.75rem' : '0'}`}
      >
        Debt is fully paid
      </Text>
    </View.Condition>

    <View.Condition if={isViewTransaction}>
      <Link
        href={href}
        target='_blank'
        mt='1.5rem'
        w='100%'
        display='block'
        textAlign='center'
        color='brand.100'
        textDecor='underline'
      >
        View Transaction Details
      </Link>
    </View.Condition>
  </Box>
);

export { TransactionSuccessfully };
