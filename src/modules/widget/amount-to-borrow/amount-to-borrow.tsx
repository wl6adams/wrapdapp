import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { View } from 'src/shared/ui/view';
import { useStore } from 'src/store';
import { formatUnits } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { Box, Button, Flex, Grid, Input, Text } from '@chakra-ui/react';

import DisconnectWallet from '@/modules/widget/disconnect-wallet/disconnect-wallet';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  formatSliceNumber,
  formatSliceTokenOrUSD,
  getTokenPrice,
  isValidNumericInput,
  removeCommas,
} from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { BULKER_ADDRESS } from '@/shared/web3/config';
import { useApproveToken } from '@/shared/web3/hook';
import { AllCollateralData } from '@/shared/web3/types';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';

const AmountToBorrow = ({ openWalletConnect }: { openWalletConnect: () => void }) => {
  const [borrowValue, setBorrowValue] = useState<string>('');

  const [sucSend, setSucSend] = useState(false);

  const { selectedMarketData, setTokenCount, setShowStep, setIsLoading, setIsAfterApprove } =
    useStore();

  const { isConnected, address, chainId } = useAccount();

  const { approveToken, isAbsoluteLoadingApprove, isSuccessApproveToken } = useApproveToken();

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId || DEFAULT_CHAIN_ID,
  });

  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedMarketData?.baseTokenAddress,
    blockTag: 'latest',
    chainId: selectedMarketData?.chainId || DEFAULT_CHAIN_ID,
  });

  const { data: isAllowed, refetch: refetchIsAllowed } = useReadContract({
    abi: CometABI,
    address: selectedMarketData?.cometAddress,
    functionName: 'isAllowed',
    args:
      address && selectedMarketData
        ? [address, BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedMarketData?.asset]]
        : undefined,
    blockTag: 'latest',
  });

  const balance = selectedMarketData?.asset === 'WETH' ? userEthBalance : tokenBalance;

  const isDisabled = !isConnected || !address;

  const debounceInput = useDebounce(Number(removeCommas(borrowValue)));

  const activeBorrowed = useMemo(
    () =>
      selectedMarketData
        ? formatUnits(selectedMarketData.borrowBalance, Number(selectedMarketData.decimals))
        : '0',
    [selectedMarketData]
  );

  const balanceInUsd = useMemo(
    () => Number(removeCommas(borrowValue)) * (selectedMarketData?.price || 0),
    [borrowValue, selectedMarketData]
  );

  const totalBorrowingAfterTransaction = useMemo(() => {
    return formatSliceTokenOrUSD(
      (Number(activeBorrowed) + Number(removeCommas(borrowValue))).toString()
    );
  }, [activeBorrowed, borrowValue]);

  const onApproveToken = () => {
    approveToken(
      {
        abi: CometABI,
        address: selectedMarketData?.cometAddress || '0x',
        functionName: 'allow',
        args: [BULKER_ADDRESS[chainId || DEFAULT_CHAIN_ID][selectedMarketData?.asset || ''], true],
      },
      {
        onSuccess: () => setSucSend(true),

        onError: (error, variables, context) => {
          console.log('--context--', context);
          console.log('--variables--', variables);
          console.log('--error--', error);
          setShowStep(2);
        },
      }
    );
  };

  const onClickButton = () => {
    if (!selectedMarketData) {
      return;
    }

    if ((selectedMarketData?.minBorrow || 0) >= debounceInput) {
      return;
    }

    if (!isAllowed) {
      onApproveToken();

      return;
    }

    setShowStep(3);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = removeCommas(e.target.value);

    if (!isNaN(Number(rawValue)) && isValidNumericInput(rawValue)) {
      setBorrowValue(rawValue);
    }
  };

  const onBlur = () => {
    if (borrowValue) {
      const input = removeCommas(borrowValue);

      setBorrowValue(input);
    }
  };

  const onFocus = () => {
    if (borrowValue) {
      setBorrowValue(removeCommas(borrowValue));
    }
  };

  useEffect(() => {
    setTokenCount(removeCommas(borrowValue));
  }, [debounceInput]);

  useEffect(() => {
    setIsLoading(isAbsoluteLoadingApprove);

    setIsAfterApprove(true);

    if (isAbsoluteLoadingApprove) {
      setShowStep(4);
    }
  }, [isAbsoluteLoadingApprove]);

  useEffect(() => {
    if (!isAbsoluteLoadingApprove && isSuccessApproveToken && sucSend) {
      refetchIsAllowed();

      setSucSend(false);

      setShowStep(3);
    }
  }, [isAbsoluteLoadingApprove, isSuccessApproveToken, sucSend]);

  const availableToBorrow = useMemo(() => {
    if (!selectedMarketData) {
      return '0';
    }

    const borrowCapacity =
      selectedMarketData.configuratorData
        .map(
          (collateral: AllCollateralData) =>
            Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
            Number(formatUnits(collateral.liquidateCollateralFactor, 18)) *
            getTokenPrice(selectedMarketData.asset, collateral.price, selectedMarketData.price)
        )
        .reduce((a: number, b: number) => a + b) / 1.5;

    const borrow = Number(activeBorrowed) * selectedMarketData.price * 1.01;

    const availableToBorrow = (borrowCapacity - borrow) / selectedMarketData.price;

    return availableToBorrow.toString();
  }, [selectedMarketData, activeBorrowed]);

  const onMax = useCallback(() => {
    setBorrowValue(formatSliceTokenOrUSD(availableToBorrow, 5));
  }, [availableToBorrow]);

  return (
    <>
      <View.Condition if={Boolean(selectedMarketData)}>
        <Flex
          flexDirection='column'
          gap='0.5rem'
          w='100%'
          p={{ base: '8px 12px', sm: '16px 14px' }}
        >
          <DisconnectWallet
            moveConnectWallet={openWalletConnect}
            isDisabled={isDisabled}
          />

          <Box
            w='100%'
            m='10px 0 '
          >
            <Divider maxW={400} />
          </Box>

          <Grid
            gridTemplateColumns='1fr'
            rowGap='8px'
            bgSize='200%'
            bgPosition='center'
            opacity={isDisabled ? 0.5 : 1}
          >
            <Flex
              flexDirection='column'
              alignItems='flex-start'
              p='16px'
              bg='rgba(255,255,255,0.08)'
              borderRadius='8px'
              gap='8px'
            >
              <Flex
                gap='5px'
                alignItems='center'
                justifyContent='space-between'
                w='100%'
              >
                <Text
                  color='brand.50'
                  size='small14500140'
                >
                  Amount to Borrow
                </Text>

                <Text
                  color='brand.800'
                  size='small14500140'
                >
                  Available:{' '}
                  {Number(availableToBorrow) > 0
                    ? formatSliceNumber(availableToBorrow, 5)
                    : '0.0000'}
                </Text>
              </Flex>

              <Text
                color='brand.550'
                size='small14120500'
                gridArea='2/ span 2'
              >
                Wallet Balance: {formatSliceTokenOrUSD((balance?.formatted || 0).toString(), 5)}
              </Text>

              <Flex gap='8px'>
                <Image
                  width={24}
                  height={24}
                  src={`/collaterals/${selectedMarketData?.asset}.svg`}
                  alt={selectedMarketData?.asset || 'market_image'}
                />

                <Flex
                  gap='0.625rem'
                  alignItems='center'
                >
                  <Input
                    maxW='270px'
                    border='0px'
                    h='30px'
                    bg='none'
                    _focus={{ border: 'none', boxShadow: 'none' }}
                    outline='none'
                    fontSize={{ base: '20px', sm: '24px' }}
                    lineHeight='110%'
                    fontWeight='600'
                    p='0'
                    placeholder='0.00'
                    value={borrowValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    readOnly={isDisabled}
                  />

                  <Text size='large20600110'>{selectedMarketData?.asset}</Text>

                  {Number(availableToBorrow) > 0 && (
                    <Button
                      w='80px'
                      h='35'
                      variant='tableButtons'
                      color='brand.100'
                      bg='brand.375'
                      onClick={onMax}
                    >
                      Max
                    </Button>
                  )}
                </Flex>
              </Flex>

              <Text
                color='brand.900'
                ml='2rem'
                size='small14120500'
              >
                {formatSliceNumber(balanceInUsd.toString(), 2)} $
              </Text>
            </Flex>
          </Grid>
          <Grid
            color='rgba(255, 255, 255, 0.5)'
            gap='5px'
          >
            <Flex justifyContent='space-between'>
              <Text size='small14120500'>Currently Borrowing</Text>

              <Text size='small14120500'>
                {formatSliceTokenOrUSD(activeBorrowed)} {selectedMarketData?.asset}
              </Text>
            </Flex>

            <Flex justifyContent='space-between'>
              <Text size='small14120500'>Total Borrowing After Transaction</Text>

              <Text size='small14120500'>
                {totalBorrowingAfterTransaction} {selectedMarketData?.asset}
              </Text>
            </Flex>
            <View.Condition
              if={Boolean(
                Number(borrowValue) && (selectedMarketData?.minBorrow || 0) >= Number(borrowValue)
              )}
            >
              <Text
                color='brand.1075'
                size='small14120500'
                textAlign='left'
              >
                Min Borrow Limit:{' '}
                {formatSliceTokenOrUSD(selectedMarketData?.minBorrow?.toString() || '0', 5)}{' '}
                {selectedMarketData?.asset}
              </Text>
            </View.Condition>
          </Grid>

          <Box
            w='100%'
            m='10px 0 '
          >
            <Divider maxW={400} />
          </Box>

          <Button
            isDisabled={
              isDisabled ||
              !borrowValue ||
              (selectedMarketData?.minBorrow || 0) >= Number(borrowValue)
            }
            onClick={onClickButton}
            variant='actionButtons'
          >
            {!isAllowed && borrowValue !== '' ? 'Allow Borrow' : 'Next'}
          </Button>
        </Flex>
      </View.Condition>
    </>
  );
};

export default AmountToBorrow;
