import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance, useFeeData, useReadContract } from 'wagmi';
import { Box, Button, Collapse, Flex, Grid, Show, Text } from '@chakra-ui/react';

import DisconnectWallet from '@/modules/supply-widget/disconnect-wallet/disconnect-wallet';
import Inputs from '@/modules/supply-widget/Inputs/Inputs';
import { useStore } from '@/modules/supply-widget/store';
import { GasIcon } from '@/shared/chakra-ui/icons';
import { GAEvent } from '@/shared/lib/gtag';
import { formatSliceTokenOrUSD, getBigNumber, getLendTransactionFee } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui/divider';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { ERC20ABI } from '@/shared/web3/abi/ERC20';
import { useApproveToken } from '@/shared/web3/hook';
import { getRPCConfig } from '@/shared/web3/rpcConfigs';
import { useRPCStore } from '@/store/rpc';

type ExchangeType = {
  showNextStep: () => void;
  showPrevStep: () => void;
  moveConnectWallet: () => void;
};

const ExchangeCard = ({ showPrevStep, showNextStep, moveConnectWallet }: ExchangeType) => {
  const {
    currentTokenData,
    inputValue,
    isChecked,
    setIsChecked,
    networkName,
    setIsLoading,
    isNotEnough,
    showStep,
    tokenName,
    currentNetwork,
    maxFeePerGas,
    setMaxFeePerGas,
    estimateGas,
    setEstimateGas,
  } = useStore();

  const { publicRPC, myWalletRPC, customRPC, customRPCList, lastChange } = useRPCStore();

  const { isConnected, address } = useAccount();

  const { approveToken, isAbsoluteLoadingApprove } = useApproveToken();

  const { data: userEthBalance } = useBalance({
    chainId: currentNetwork,
    address: address,
    blockTag: 'latest',
  });

  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20ABI,
    address: currentTokenData.addressFrom,
    functionName: 'allowance',
    args: address && !currentTokenData.isNative ? [address, currentTokenData.addressTo] : undefined,
    blockTag: 'latest',
  });

  const { data: isAllowed, refetch: refetchIsAllow } = useReadContract({
    abi: CometABI,
    address: currentTokenData.addressTo,
    functionName: 'isAllowed',
    args: address ? [address, currentTokenData.bulker] : undefined,
    blockTag: 'latest',
  });

  const [showGas] = useState(false);

  const [estimatedGasPriceETH, setEstimatedGasPriceETH] = useState(BigInt(0));

  const isDisabled = !isConnected || !address;

  const cantPayFee = useMemo(() => {
    if (!inputValue || !estimatedGasPriceETH || !userEthBalance) {
      return false;
    }

    const userBalance = userEthBalance.value;

    if (estimatedGasPriceETH >= userBalance) {
      return true;
    }

    const isInsufficientNativeBalance =
      currentTokenData.isNative &&
      isChecked &&
      Number(inputValue) > Number(formatUnits(userBalance - estimatedGasPriceETH, 18));

    return isInsufficientNativeBalance;
  }, [inputValue, estimatedGasPriceETH, userEthBalance, isChecked, currentTokenData]);

  const isDisableApprove = cantPayFee || isDisabled || inputValue === '' || isNotEnough;

  const isNeedApprove = useMemo(() => {
    if (
      getBigNumber(inputValue, currentTokenData.decimals) <= BigInt(0) ||
      currentTokenData.isNative
    )
      return false;

    const value = getBigNumber(inputValue, currentTokenData.decimals);

    return BigInt(usdtAllowance || 0) < value;
  }, [usdtAllowance, inputValue, currentTokenData.decimals, currentTokenData.isNative]);

  const { data } = useFeeData({
    chainId: currentNetwork,
  });

  useEffect(() => {
    if (!currentNetwork || !address || !currentTokenData || !userEthBalance?.value || !data) {
      return;
    }
    (async () => {
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
        isNeedApprove,
        isAllowed,
        rightRPC
      );

      if (data?.maxFeePerGas && response?.estimateGas) {
        setEstimateGas(response.estimateGas);
        setMaxFeePerGas(data.maxFeePerGas);

        setEstimatedGasPriceETH(data.maxFeePerGas * response.estimateGas);
      } else {
        setEstimateGas(BigInt(0));
        setMaxFeePerGas(BigInt(0));
      }
    })();
  }, [
    userEthBalance,
    currentTokenData,
    currentNetwork,
    address,
    inputValue,
    isNeedApprove,
    isAllowed,
    isChecked,
    data,
  ]);

  const onClickButton = () => {
    if (getBigNumber(inputValue, currentTokenData.decimals) <= BigInt(0)) {
      return;
    }

    if (!isAllowed) {
      approveToken(
        {
          abi: CometABI,
          address: currentTokenData.addressTo,
          functionName: 'allow',
          args: [currentTokenData.bulker, true],
          ...(maxFeePerGas && { gasPrice: maxFeePerGas }),
          ...(estimateGas && { gas: estimateGas }),
        },
        {
          onSuccess: () => {
            refetchIsAllow();
            GAEvent(
              'transaction',
              'event',
              `allow ${address}_${inputValue}_${networkName}_${tokenName}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
            showPrevStep();
          },
        }
      );
    }

    if (isNeedApprove) {
      approveToken(
        {
          abi: ERC20ABI,
          address: currentTokenData.addressFrom,
          functionName: 'approve',
          args: [currentTokenData.addressTo, getBigNumber(inputValue, currentTokenData.decimals)],
          ...(maxFeePerGas && { gasPrice: maxFeePerGas }),
          ...(estimateGas && { gas: estimateGas }),
        },
        {
          onSuccess: () => {
            refetchIsAllow();
            GAEvent(
              'transaction',
              'event',
              `approve ${address}_${inputValue}_${networkName}_${tokenName}`
            );
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
            showPrevStep();
          },
        }
      );
    }

    showNextStep();
  };

  const networkCost = useMemo(
    () => formatSliceTokenOrUSD(formatUnits(estimatedGasPriceETH, 18), 5),
    [estimatedGasPriceETH]
  );

  useEffect(() => {
    setIsChecked(true);
  }, [setIsChecked]);

  useEffect(() => {
    refetchIsAllow();
    refetchAllowance();
  }, [showStep]);

  useEffect(() => {
    setIsLoading(isAbsoluteLoadingApprove);
  }, [isAbsoluteLoadingApprove, setIsLoading]);

  return (
    <>
      <DisconnectWallet
        moveConnectWallet={moveConnectWallet}
        isDisabled={isDisabled}
      />

      <Box
        w='100%'
        m='10px 0'
      >
        <Divider w={400} />
      </Box>

      <Inputs
        isDisabled={isDisabled}
        cantPayFee={cantPayFee}
        estimatedGasPriceETH={Number(formatUnits(estimatedGasPriceETH, 18))}
      />

      <Grid gridTemplateColumns='repeat(2, 1fr)'>
        <Text size='small14400'>Network Cost</Text>

        <Flex
          alignItems='center'
          justifySelf='flex-end'
          columnGap='8px'
        >
          <GasIcon />

          <Text size='small14400'>{networkCost} ETH</Text>
        </Flex>
      </Grid>

      <Collapse
        in={showGas}
        endingHeight='75px'
        transition={{
          exit: { ease: 'linear', duration: 0.4 },
          enter: { ease: 'linear', duration: 0.4 },
        }}
      >
        <Grid
          gridTemplateColumns='repeat(2, 1fr)'
          opacity='0.5'
        >
          <Text size='small14400'>Max. slippage</Text>

          <Text
            size='small14400'
            textAlign='right'
          >
            0.5%
          </Text>

          <Text size='small14400'>Fee (0.25%)</Text>

          <Text
            size='small14400'
            textAlign='right'
          >
            1.00 USD
          </Text>

          <Text size='small14400'>Order routing</Text>

          <Text
            size='small14400'
            textAlign='right'
          >
            {networkName}
          </Text>
        </Grid>
      </Collapse>

      <Box
        w='100%'
        m='10px 0 '
      >
        <Divider w={400} />
      </Box>

      <Button
        isDisabled={isDisableApprove}
        onClick={onClickButton}
        variant='actionButtons'
      >
        {isNeedApprove ? 'Approve Amount' : !isAllowed ? 'Allow' : 'Next'}
      </Button>
    </>
  );
};

const Exchange = ({ showPrevStep, showNextStep, moveConnectWallet }: ExchangeType) => {
  return (
    <>
      <Show breakpoint='(max-width: 1249px)'>
        <Flex
          gap='0.5rem'
          flexDirection='column'
          p={{ base: '8px 12px', sm: '16px 24px' }}
        >
          <ExchangeCard
            showPrevStep={showPrevStep}
            showNextStep={showNextStep}
            moveConnectWallet={moveConnectWallet}
          />
        </Flex>
      </Show>

      <Show breakpoint='(min-width: 1250px)'>
        <Grid
          w='100%'
          gridTemplateColumns='1fr'
          rowGap='8px'
          p={{ base: '8px 12px', sm: '16px 24px' }}
          bgRepeat='repeat'
        >
          <ExchangeCard
            showPrevStep={showPrevStep}
            showNextStep={showNextStep}
            moveConnectWallet={moveConnectWallet}
          />
        </Grid>
      </Show>
    </>
  );
};

export default Exchange;
