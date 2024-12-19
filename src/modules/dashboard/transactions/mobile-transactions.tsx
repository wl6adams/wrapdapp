import React from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { Button, Flex, Grid, Skeleton, Text } from '@chakra-ui/react';

import { TransactionsColors } from '@/modules/dashboard/transactions/desctop-transactions';
import { formatSliceTokenOrUSD, formattedDate, getTokenPrice } from '@/shared/lib/utils';
import { CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { NetworksNames } from '@/shared/web3/config';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';
import { TransactionData } from '@/store/transaction';

interface MobileTransactionsProps {
  transaction: TransactionData;

  isLoaded: boolean;
}

const MobileTransactions = ({ transaction, isLoaded }: MobileTransactionsProps) => {
  const { allMarketsData, compoundPrice } = useStore();

  const currentMarketData = allMarketsData.find(
    (data) => data.chainId === transaction.network && transaction.market === data.asset
  );

  const collateralData =
    currentMarketData?.configuratorData?.find(({ asset }) => asset === transaction.collateral) ??
    null;

  const decimals = (() => {
    if (!currentMarketData) return 18;
    if (['Lend', 'Withdraw'].includes(transaction.event)) {
      return Number(currentMarketData.decimals);
    }
    return collateralData ? collateralData.decimals : 18;
  })();

  const price = (() => {
    if (collateralData && currentMarketData) {
      return getTokenPrice(currentMarketData.asset, collateralData.price, currentMarketData.price);
    }
    return currentMarketData ? currentMarketData.price : compoundPrice;
  })();

  return (
    <Grid
      gridTemplateColumns='repeat(2, 1fr)'
      w='100%'
      bg={isLoaded ? 'brand.400' : 'brand.1650'}
      p='1.5rem 1rem'
      borderRadius='0.5rem'
      gap='0.75rem'
    >
      <Skeleton
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Grid
          gridTemplateColumns='1.25rem 1fr'
          alignItems='center'
          borderBottom='1px solid'
          borderColor='brand.500'
          pb='0.75rem'
          gap='0.25rem'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Asset
          </Text>

          <Image
            width={16}
            height={16}
            src={`/collaterals/${collateralData ? collateralData.symbol : transaction.market}.svg`}
            alt={transaction.market}
          />

          <Text
            size='small14500140'
            color='brand.50'
            letterSpacing='0.02em'
          >
            {collateralData ? collateralData.symbol : transaction.market}
          </Text>
        </Grid>
      </Skeleton>

      <Skeleton
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Grid
          gridTemplateColumns='1.25rem 1fr'
          alignItems='center'
          borderBottom='1px solid'
          borderColor='brand.500'
          pb='0.75rem'
          gap='0.25rem'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
            gridArea='1/ span 2'
          >
            Market
          </Text>
          <Image
            width={16}
            height={16}
            src={`/markets/${NetworksNames[transaction.network].toLowerCase()}_active.svg`}
            alt={transaction.network.toString()}
          />
          <Text
            size='small14500140'
            color='brand.50'
            letterSpacing='0.02em'
          >
            {NetworksNames[transaction.network]}
          </Text>
        </Grid>
      </Skeleton>

      <Skeleton
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Grid
          gridTemplateColumns='1fr'
          alignItems='center'
          borderBottom='1px solid'
          borderColor='brand.500'
          pb='0.75rem'
          gap='0.25rem'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
          >
            Operation
          </Text>

          <Text
            size='small14500140'
            letterSpacing='0.02em'
            color={TransactionsColors(transaction.event)}
            textTransform='capitalize'
          >
            {transaction.event}
          </Text>
        </Grid>
      </Skeleton>

      <Skeleton
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Grid
          gridTemplateColumns='1fr'
          alignItems='center'
          borderBottom='1px solid'
          borderColor='brand.500'
          pb='0.75rem'
          gap='0.25rem'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
          >
            Time
          </Text>
          <Text
            size='small14500140'
            color='brand.50'
            letterSpacing='0.02em'
          >
            {formattedDate(new Date(Number(transaction.date) * 1000))}
          </Text>
        </Grid>
      </Skeleton>

      <Skeleton
        gridArea='3 / span 2'
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Grid
          gridArea='3 / span 2'
          gridTemplateColumns='1fr'
          alignItems='center'
          borderBottom='1px solid'
          borderColor='brand.500'
          pb='0.75rem'
          gap='0.25rem'
        >
          <Text
            size='small12400120'
            color='brand.650'
            letterSpacing='0.02em'
          >
            Amount
          </Text>

          <Flex
            alignItems='flex-center'
            gap='4px'
          >
            <Text size='small14120500'>
              {formatSliceTokenOrUSD(formatUnits(transaction.value, decimals), 5)}
            </Text>
            <Text
              size='small14120500'
              color='brand.650'
            >
              $
              {formatSliceTokenOrUSD(
                (Number(formatUnits(transaction.value, decimals)) * price).toString()
              )}
            </Text>
          </Flex>
        </Grid>
      </Skeleton>

      <Skeleton
        gridArea='4 / span 2'
        borderRadius='50px'
        startColor='brand.150'
        minH={!isLoaded ? '42px' : 'auto'}
        isLoaded={isLoaded}
      >
        <Button
          gridArea='4 / span 2'
          variant='tableButtons'
          w='100%'
          onClick={() =>
            window.open(
              `${CurrentNetworkExplorerURL[Number(transaction.network) || DEFAULT_CHAIN_ID]}/tx/${transaction.hash}`,
              '_blank'
            )
          }
        >
          Details
        </Button>
      </Skeleton>
    </Grid>
  );
};

export default MobileTransactions;
