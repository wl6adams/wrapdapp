import { FC, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { formatUnits, parseUnits } from 'viem';
import { Collapse, Flex, Grid, Show, Text } from '@chakra-ui/react';

import Charts from '@/modules/dashboard/charts/charts';
import LendButton from '@/modules/market/lend-button/lend-button';
import { formatSliceNumber, formatSliceTokenOrUSD } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { View } from '@/shared/ui/view';
import { NetworksNames } from '@/shared/web3/config';
import { TableData } from '@/shared/web3/types';

const WithdrawButton = dynamic(
  () => import('@/modules/dashboard/withdraw-button/withdraw-button'),
  {
    ssr: false,
  }
);

interface MobileCardProps {
  data: TableData;

  index: number;

  selectedPositionLending: number;

  onSelectedPositionLending: () => void;

  onLendClick: () => void;
}

const MobileCard: FC<MobileCardProps> = ({
  data,
  index,
  selectedPositionLending,
  onLendClick,
  onSelectedPositionLending,
}) => {
  const balance = useMemo(() => {
    const result = formatUnits(data.supplyBalance, Number(data.decimals));

    return formatSliceTokenOrUSD(result, 5);
  }, [data.supplyBalance, data.decimals]);

  return (
    <Grid
      key={`${data.asset}_${index}`}
      alignItems='flex-start'
    >
      <Grid
        bg={selectedPositionLending === index ? 'brand.400' : 'brand.1100'}
        onClick={() => onSelectedPositionLending()}
        p='1.25rem .7rem'
        borderRadius={selectedPositionLending === index ? '0.5rem 0.5rem 0 0' : '0.5rem'}
        gap='0.5rem'
        cursor='pointer'
      >
        <Grid gridTemplateColumns='1.5rem 1.5rem 1fr'>
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

        <Grid
          gridTemplateColumns={{
            base: 'max-content',
            md: 'repeat(2, max-content)',
          }}
          alignItems='center'
          gap='0.5rem'
        >
          <Flex
            w='fit-content'
            border='1px solid'
            borderColor='brand.600'
            borderRadius='4px'
            p='4px 8px'
            gap='8px'
          >
            <Text
              size='medium18500120'
              letterSpacing='0.02em'
              color='brand.650'
            >
              Balance:
            </Text>
            <Text
              size='medium18500120'
              letterSpacing='0.02em'
            >
              {balance}
              ($
              {formatSliceTokenOrUSD(
                Number(data.supplyBalance) * data.price < parseUnits('0.01', Number(data.decimals))
                  ? '0.01'
                  : formatSliceNumber(
                      (
                        Number(formatUnits(data.supplyBalance, Number(data.decimals))) * data.price
                      ).toString()
                    ),
                2
              )}
              )
            </Text>
          </Flex>

          <Flex
            w='fit-content'
            border='1px solid'
            borderColor='brand.600'
            borderRadius='4px'
            p='4px 8px'
            gap='8px'
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
              {data.netEarnAPY.toFixed(2)}%
            </Text>
          </Flex>
        </Grid>

        <View.Condition if={selectedPositionLending === index}>
          <Divider
            maxW={400}
            m='0.5rem 0'
            bg='brand.500'
          />
        </View.Condition>

        <Collapse
          in={selectedPositionLending === index}
          endingHeight='40px'
          transition={{
            exit: { ease: 'linear', duration: 0.3 },
            enter: { ease: 'linear', duration: 0.3 },
          }}
        >
          <Grid
            gridTemplateColumns='repeat(2, 1fr)'
            gap='0.5rem'
          >
            <WithdrawButton marketData={data} />

            <LendButton
              marketData={data}
              textButton='Lend More'
              variant='lendMoreButtons'
              onClick={onLendClick}
            />
          </Grid>
        </Collapse>
      </Grid>

      <Show breakpoint='(max-width: 991px)'>
        <Collapse in={selectedPositionLending === index}>
          <Charts
            bg='brand.1100'
            borderRadius='0 0 0.5rem 0.5rem'
          />
        </Collapse>
      </Show>
    </Grid>
  );
};

export { MobileCard };
