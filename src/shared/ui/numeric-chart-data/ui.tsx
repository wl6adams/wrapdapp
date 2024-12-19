'use client';

import { useMemo } from 'react';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Box, Flex, Grid, Text, Tooltip } from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';

import { View } from '../view';

const NumericChartData = ({
  title,
  Earning,
  Borrowing,
  Collateral,
}: {
  title?: string;
  Earning: string;
  Borrowing: string;
  Collateral: string;
}) => {
  const [isLessThan480] = useMediaQuery('(max-width: 480px)');

  const totalSupply = useMemo(() => {
    const chartData = [Earning, Collateral];

    return chartData.reduce((acc, cur) => acc + Number(cur || 0), 0);
  }, [Earning, Collateral]);

  return (
    <Flex
      w='100%'
      flexDirection={{ base: 'column', sm: 'row' }}
      justifyContent='space-between'
      m={{ base: '20px 0', md: '20px 0' }}
    >
      <View.Condition if={!isLessThan480}>
        <Tooltip
          label='All base and collateral assets deposited into the protocol'
          bg='brand.400'
          color='brand.300'
          placement='bottom'
          maxW='185px'
          textAlign='center'
          borderRadius='0.25rem'
          hasArrow
        >
          <Grid
            cursor='pointer'
            gridTemplateColumns='1fr'
            justifyContent='flex-start'
          >
            <Text
              size='small14120500'
              textAlign='start'
              color='brand.50'
            >
              Total supply
            </Text>

            <Text
              size='small32500160'
              color='brand.100'
            >
              ${formatNumber(totalSupply)}
            </Text>
          </Grid>
        </Tooltip>
      </View.Condition>

      <View.Condition if={isLessThan480}>
        <Text
          size='large28500150'
          mb={{ base: '32px' }}
        >
          {title}
        </Text>

        <Flex
          alignItems='center'
          gap='5px'
        >
          <Text
            size='small14120500'
            textAlign='start'
            color='brand.50'
            mb={{ base: '-2px' }}
          >
            Total supply
          </Text>

          <Text
            size='small32500160'
            color='brand.100'
          >
            ${formatNumber(totalSupply)}
          </Text>
        </Flex>
      </View.Condition>

      <Flex
        justifyContent={{ base: 'space-between', sm: 'space-between' }}
        columnGap={{ base: '25px', sm: '25px', md: '32px', lg: '50px' }}
        rowGap={{ base: '25px', sm: '25px', md: '0' }}
        mt={{ base: '10px', md: '0', sm: '16px' }}
      >
        <Tooltip
          label='Total assets lent out and earning interest'
          bg='brand.400'
          color='brand.300'
          placement='bottom'
          maxW='185px'
          textAlign='center'
          borderRadius='0.25rem'
          hasArrow
        >
          <Grid
            cursor='pointer'
            gridTemplateColumns={{ base: '17px max-content', sm: '1fr max-content' }}
            columnGap='8px'
            alignItems='center'
          >
            <Box
              justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
              w='13px'
              h='13px'
              borderRadius='50%'
              bg='brand.100'
            />

            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              size='small14120500'
              color='brand.100'
            >
              Earning
            </Text>

            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              w={{ lg: '180px' }}
              size='small32500160'
              gridArea='2/ span 2'
            >
              ${formatNumber(Number(Earning))}
            </Text>
          </Grid>
        </Tooltip>

        <Tooltip
          label='Total assets borrowed'
          bg='brand.400'
          color='brand.300'
          placement='bottom'
          maxW='185px'
          textAlign='center'
          borderRadius='0.25rem'
          hasArrow
        >
          <Grid
            cursor='pointer'
            gridTemplateColumns={{ base: '17px max-content', sm: '1fr max-content' }}
            columnGap='8px'
            alignItems='center'
          >
            <Box
              justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
              w='13px'
              h='13px'
              borderRadius='50%'
              bg='brand.1375'
            />

            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              size='small14120500'
              color='brand.1375'
            >
              Borrowing
            </Text>

            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              w={{ lg: '180px' }}
              size='small32500160'
              gridArea='2/ span 2'
            >
              ${formatNumber(Number(Borrowing))}
            </Text>
          </Grid>
        </Tooltip>

        <View.Condition if={Boolean(Collateral)}>
          <Tooltip
            label='Total collateral assets deposited'
            bg='brand.400'
            color='brand.300'
            placement='bottom'
            maxW='185px'
            textAlign='center'
            borderRadius='0.25rem'
            hasArrow
          >
            <Grid
              cursor='pointer'
              gridTemplateColumns={{ base: '17px max-content', sm: '1fr max-content' }}
              columnGap='8px'
              alignItems='center'
            >
              <Box
                justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
                w='13px'
                h='13px'
                borderRadius='50%'
                bg='rgb(8 187 195)'
              />

              <Text
                textAlign={{ base: 'left', sm: 'right' }}
                size='small14120500'
                color='rgb(8 187 195)'
              >
                Collateral
              </Text>

              <Text
                textAlign={{ base: 'left', sm: 'right' }}
                w={{ lg: '180px' }}
                size='small32500160'
                gridArea='2/ span 2'
              >
                ${formatNumber(Number(Collateral))}
              </Text>
            </Grid>
          </Tooltip>
        </View.Condition>
      </Flex>
    </Flex>
  );
};

export { NumericChartData };
