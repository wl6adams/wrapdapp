'use client';

import { useMediaQuery } from '@chakra-ui/media-query';
import { Box, Flex, Grid, Text, Tooltip } from '@chakra-ui/react';

import { formatNumber } from '@/shared/lib/utils';
import { View } from '@/shared/ui/view';

const ChartData = ({
  title,
  Earning,
  totalSupply,
}: {
  title?: string;
  Earning: string;
  totalSupply: number;
}) => {
  const [isLessThan480] = useMediaQuery('(max-width: 480px)');

  return (
    <Flex
      w='100%'
      flexDirection={{ base: 'column', sm: 'row' }}
      justifyContent='space-between'
      m={{ base: '20px 0 20px', md: '20px 0' }}
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
          mb='32px'
        >
          {title}
        </Text>
      </View.Condition>

      <Grid
        gridTemplateColumns={`repeat(${isLessThan480 ? 2 : 1}, 1fr)`}
        columnGap={{ base: '16px', sm: '32px' }}
        rowGap={{ base: '16px', md: '0' }}
        mt={{ base: '10px', md: '0', sm: '16px' }}
      >
        <View.Condition if={isLessThan480}>
          <Grid alignItems='center'>
            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              size='small14120500'
              color='brand.50'
            >
              Total supply
            </Text>

            <Text
              textAlign={{ base: 'left', sm: 'right' }}
              w={{ lg: '180px' }}
              size='small32500160'
              gridArea='2/ span 2'
            >
              ${formatNumber(totalSupply)}
            </Text>
          </Grid>
        </View.Condition>

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
            gridTemplateColumns={{ base: '1fr', sm: '1fr max-content' }}
            columnGap='8px'
            alignItems='center'
            justifyItems='end'
          >
            <Flex gap='8px'>
              <Box
                justifySelf={{ base: 'flex-start', sm: 'flex-end' }}
                w='13px'
                h='13px'
                borderRadius='50%'
                bg='brand.100'
                flexShrink={0}
              />

              <Text
                textAlign={{ base: 'left', sm: 'right' }}
                size='small14120500'
                color='brand.100'
              >
                Earning
              </Text>
            </Flex>

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
      </Grid>
    </Flex>
  );
};

export { ChartData };
