import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useBalance, useFeeData } from 'wagmi';
import { Box, Button, Grid, Image, Text } from '@chakra-ui/react';

import { useStore } from '@/modules/supply-widget/store';
import { TransactionSuccessfully } from '@/modules/transaction-successfully/transaction-successfully';
import Loader from '@/modules/widget/loader/loader';
import { ACTION_SUPPLY_NATIVE_TOKEN, ACTION_SUPPLY_TOKEN } from '@/shared/consts/constant';
import { useMixpanelAnalytics } from '@/shared/hooks/useMixpanelAnalytics';
import { GAEvent } from '@/shared/lib/gtag';
import { formatCommaNumber, getBigNumber, getLendTransactionFee } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { View } from '@/shared/ui/view';
import { BulkerABI } from '@/shared/web3/abi/BulkerABI';
import { CurrentNetworkExplorerURL } from '@/shared/web3/chainConfig';
import { useBuyTokensWithETH } from '@/shared/web3/hook';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useDashboardStore } from '@/store/dashboard';
import { useRPCStore } from '@/store/rpc';

const AfterTransaction = ({
  onLandMore,
  submittedTransaction,
}: {
  onLandMore: () => void;
  submittedTransaction: () => void;
}) => {
  const { mixpanelTrackEvent } = useMixpanelAnalytics();

  const { address, chainId } = useAccount();

  const {
    inputValue,
    isChecked,
    tokenName,
    currentTokenData,
    isLoadingTransaction,
    currentNetwork,
    networkName,
    selectedMarketData,
  } = useStore();

  const { setReloadData } = useDashboardStore();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const { buyTokensWithETH, isAbsoluteLoadingBuy, txHash: txHashNative } = useBuyTokensWithETH();

  const [isSuccessful, setIsSuccessful] = useState(false);

  const isTransactionSuccess = useMemo(
    () => isLoadingTransaction || isAbsoluteLoadingBuy,
    [isLoadingTransaction, isAbsoluteLoadingBuy]
  );

  const { data: userEthBalance } = useBalance({
    chainId: currentNetwork,
    address: address,
    blockTag: 'latest',
  });

  const { data: feeData } = useFeeData({
    chainId: currentNetwork,
  });

  const onClickTransaction = async () => {
    if (!address || !userEthBalance) {
      return;
    }
    const rightRPC = getRPCConfig(
      address,
      publicRPC,
      myWalletRPC,
      customRPC,
      lastChange,
      customRPCList
    );

    const response = await getLendTransactionFee(
      currentNetwork,
      currentTokenData.decimals,
      currentTokenData.addressTo,
      currentTokenData.addressFrom,
      currentTokenData.bulker,
      address,
      userEthBalance.value,
      currentTokenData.isNative && isChecked,
      inputValue,
      false,
      true,
      rightRPC
    );

    if (currentTokenData.isNative && isChecked) {
      const data = [
        currentTokenData.addressTo,
        address,
        getBigNumber(inputValue, currentTokenData.decimals),
      ];

      const supplyWETH = [
        ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint'], data) as '0xstring',
      ];

      buyTokensWithETH(
        {
          abi: BulkerABI,
          address: currentTokenData.bulker,
          functionName: 'invoke',
          args: [[ACTION_SUPPLY_NATIVE_TOKEN], supplyWETH],
          value: getBigNumber(inputValue, currentTokenData.decimals),
          ...(feeData?.maxFeePerGas && { gasPrice: feeData.maxFeePerGas }),
          ...(response?.estimateGas && { gas: response.estimateGas }),
        },
        {
          onSuccess: () => {
            setIsSuccessful(true);
            GAEvent(
              'transaction',
              'event',
              `buy native ${address}_${inputValue}_${networkName}_${tokenName}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
          },
        }
      );
    } else {
      const data = [
        currentTokenData.addressTo,
        address,
        currentTokenData.addressFrom,
        getBigNumber(inputValue, currentTokenData.decimals),
      ];

      const supplyToken = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'address', 'uint'],
        data
      ) as `0x${string}`;

      buyTokensWithETH(
        {
          abi: BulkerABI,
          address: currentTokenData.bulker,
          functionName: 'invoke',
          args: [[ACTION_SUPPLY_TOKEN], [supplyToken]],
          ...(feeData?.maxFeePerGas && { gasPrice: feeData.maxFeePerGas }),
          ...(response?.estimateGas && { gas: response.estimateGas }),
        },
        {
          onSuccess: () => {
            setIsSuccessful(true);
            GAEvent(
              'transaction',
              'event',
              `buy token ${address}_${inputValue}_${networkName}_${tokenName}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (!isTransactionSuccess && isSuccessful) {
      console.log('is we trigger here');
      submittedTransaction();

      setReloadData(true);

      mixpanelTrackEvent('Conversion', {
        transaction_id: txHashNative,
        chain_id: chainId,
        source: 'Internal Test',
        element: 'Lend Modal',
      });
    }
  }, [isSuccessful, isTransactionSuccess]);

  return (
    <Grid
      border='1px solid'
      borderColor='#2e2e2e'
      p='52px 24px'
      rowGap='24px'
      bgPosition='center'
    >
      <View.Condition if={isTransactionSuccess}>
        <Loader />
      </View.Condition>

      <View.Condition if={!isTransactionSuccess && !isSuccessful}>
        <Grid
          gridTemplateColumns='1fr'
          rowGap='12px'
          w='100%'
        >
          <Text
            textAlign='center'
            size='large24700120'
          >
            Review & Submit
          </Text>

          <Grid
            w='100%'
            gridTemplateColumns='24px 1fr'
            p='16px'
            alignItems='center'
            bg='rgba(255,255,255,0.08)'
            borderRadius='8px'
            rowGap='8px'
            columnGap='8px'
            position='relative'
            mt='10px'
          >
            <Text
              color='rgba(255,255,255,0.5)'
              size='small14500140'
              gridArea='1/ span 2'
            >
              Lending
            </Text>

            <Image
              w='24px'
              h='24px'
              src={`/collaterals/${tokenName}.svg`}
              alt={tokenName}
            />

            <Text size='large24600110'>{formatCommaNumber(inputValue, 8)}</Text>

            <Text
              color='rgba(255,255,255,0.5)'
              size='small14500140'
              gridArea='3/ span 2'
            >
              {selectedMarketData && inputValue
                ? (Number(inputValue) * selectedMarketData.price).toFixed(2)
                : 0.0}
              $
            </Text>

            <Button
              position='absolute'
              variant='maxButtons'
              w={{ md: '100px' }}
              right={{ base: '10px', md: '15px' }}
              top={{ base: '70px', sm: '43px', md: '40px', lg: '35px' }}
              p={{ base: '5px 10px', md: '9px 10px' }}
              onClick={onLandMore}
            >
              Lend More
            </Button>
          </Grid>

          <Box
            w='100%'
            m='5px 0 '
          >
            <Divider />
          </Box>

          <Button
            variant='actionButtons'
            onClick={onClickTransaction}
          >
            Submit Transaction
          </Button>
        </Grid>
      </View.Condition>

      <View.Condition if={!isTransactionSuccess && isSuccessful}>
        <TransactionSuccessfully
          href={`${CurrentNetworkExplorerURL[currentNetwork]}/tx/${txHashNative}`}
          onLendMore={onLandMore}
        />
      </View.Condition>
    </Grid>
  );
};

export default AfterTransaction;
