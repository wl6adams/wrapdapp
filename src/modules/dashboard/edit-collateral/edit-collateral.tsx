import { useMemo, useState } from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { Button, Flex, Tooltip } from '@chakra-ui/react';

import { EditCollateral } from '@/modules/edit-collateral';
import { useStore } from '@/modules/supply-widget/store';
import { getTokenPrice } from '@/shared/lib/utils';
import { contractsConfig, NetworksNames } from '@/shared/web3/chainConfig';
import { AllCollateralData } from '@/shared/web3/types';
import { useDashboardStore } from '@/store/dashboard';
import { ModalsLayout } from '@/widgets/modal';

const numberPercentsLeft = 2;

const EditCollateralButton = ({
  borrowAmountUSD,
  currentCollateralData,
  reGetData,
}: {
  borrowAmountUSD: number;
  currentCollateralData: AllCollateralData;
  reGetData: () => void;
}) => {
  const [openModal, setOpenModal] = useState(false);

  const {
    setCurrentNetwork,
    setTokenName,
    setCurrentTokenData,
    setNetworkName,
    setSelectedMarketData,
  } = useStore();

  const { selectedPosition, borrowedCards } = useDashboardStore();

  const [collateralAction, setCollateralAction] = useState<'plus' | 'minus'>('plus');

  const titleEditCollateral = useMemo(() => {
    return collateralAction === 'plus' ? 'Add Collateral' : 'Reduce Collateral';
  }, [collateralAction]);

  const { address } = useAccount();

  const selectedMarket = borrowedCards[selectedPosition];

  const onCollateralActionClick = (action: 'plus' | 'minus') => {
    setCollateralAction(action);

    setOpenModal(true);

    setSelectedMarketData(selectedMarket);

    setCurrentNetwork(selectedMarket.chainId);

    setTokenName(selectedMarket.asset);

    setCurrentTokenData(contractsConfig.token[selectedMarket.chainId][selectedMarket.asset]);

    setNetworkName(NetworksNames[selectedMarket.chainId]);
  };

  const { data: userEthBalance } = useBalance({
    address: address,
    blockTag: 'latest',
    chainId: selectedMarket.chainId,
  });

  const isCanSupply = useMemo(() => {
    return (
      (currentCollateralData.symbol === 'WETH'
        ? Number(userEthBalance?.formatted) > 0 || currentCollateralData.balanceOf > BigInt(0)
        : currentCollateralData.balanceOf > BigInt(0)) && selectedMarket.borrowBalance > BigInt(0)
    );
  }, [currentCollateralData, selectedMarket]);

  const collateralPrice = useMemo(() => {
    if (!selectedMarket) {
      return 0;
    }

    return getTokenPrice(selectedMarket.asset, currentCollateralData.price, selectedMarket.price);
  }, [selectedMarket, currentCollateralData.price]);

  const maxWithdrawAmount = useMemo(() => {
    const supplyAmount = formatUnits(
      currentCollateralData.totalSupply,
      currentCollateralData.decimals
    );
    if (selectedMarket.borrowBalance > BigInt(0)) {
      const collateralSupplyAmountUSD = Number(supplyAmount) * collateralPrice;

      const collateralFactor = Number(formatUnits(currentCollateralData.liquidationFactor, 18));

      const maxWithdrawUSD = collateralSupplyAmountUSD - borrowAmountUSD / collateralFactor;

      const tokens = maxWithdrawUSD / collateralPrice;

      const percent = (tokens / 100) * numberPercentsLeft;

      return (tokens - percent).toString() || '0';
    } else {
      return supplyAmount;
    }
  }, [currentCollateralData, borrowAmountUSD, borrowedCards, selectedPosition]);

  const isCanWithdraw = useMemo(() => {
    if (currentCollateralData.totalSupply <= BigInt(0)) {
      return false;
    }

    return Number(maxWithdrawAmount) > 0;
  }, [maxWithdrawAmount]);

  return (
    <>
      <Flex
        gap='8px'
        gridArea={{ base: '2/ 2', md: '1/ 3' }}
      >
        <Tooltip
          hasArrow
          placement='top'
          display={!isCanSupply ? 'block' : 'none'}
          bg='brand.400'
          color='brand.50'
          label='Not enough balance to supply'
          maxW='146px'
          textAlign='center'
        >
          <Button
            variant='circleButtons'
            w='42px'
            h='42px'
            opacity={1}
            bg={!isCanSupply ? 'brand.1100' : 'brand.400'}
            isDisabled={!isCanSupply}
            onClick={() => onCollateralActionClick('plus')}
          >
            <Image
              width={16}
              height={16}
              src='/plus.svg'
              alt='plus'
            />
          </Button>
        </Tooltip>

        <Tooltip
          hasArrow
          placement='top'
          display={!isCanWithdraw ? 'block' : 'none'}
          bg='brand.400'
          color='brand.50'
          maxW='146px'
          textAlign='center'
          label='No asset to withdraw'
        >
          <Button
            variant='circleButtons'
            w='42px'
            h='42px'
            opacity={1}
            bg={!isCanWithdraw ? 'brand.1100' : 'brand.400'}
            isDisabled={!isCanWithdraw}
            onClick={() => onCollateralActionClick('minus')}
          >
            <Image
              width={16}
              height={16}
              src='/minus.svg'
              alt='minus'
            />
          </Button>
        </Tooltip>
      </Flex>

      <ModalsLayout
        isHiddenClose
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <EditCollateral
          title={titleEditCollateral}
          onClose={() => setOpenModal(false)}
          maxWithdrawAmount={maxWithdrawAmount}
          currentCollateralData={currentCollateralData}
          collateralAction={collateralAction}
          reGetData={reGetData}
          openWalletConnect={() => {}}
        />
      </ModalsLayout>
    </>
  );
};

export { EditCollateralButton };
