'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from 'src/store';
import { useAccount } from 'wagmi';
import { Button, useDisclosure } from '@chakra-ui/react';

import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { TableData } from '@/shared/web3/types';
import { useDashboardStore } from '@/store/dashboard';
import { ModalsLayout } from '@/widgets/modal';

const WithdrawWidget = dynamic(
  () => import('@/modules/dashboard/withdraw-widget/withdraw-widget'),
  {
    ssr: false,
  }
);
const WithdrawButton = ({
  marketData,
  ...styles
}: {
  marketData: TableData;
  [key: string]: any;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setReloadData } = useDashboardStore();

  const { setShowStep } = useStore();

  const { address } = useAccount();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const onChangeUserPosition = () => {
    if (!address) {
      onOpen();
    } else {
      setShowStep(1);

      setOpenModal(true);
    }
  };

  const onWalletConnectClose = () => {
    onClose();

    setOpenModal(true);
  };

  const onWithdrawClose = () => {
    setOpenModal(false);

    setReloadData(true);
  };

  useEffect(() => {
    if (!address) {
      setOpenModal(false);

      setShowStep(1);
    }
  }, [address, setShowStep]);

  return (
    <>
      <Button
        variant='withDrawButtons'
        isDisabled={marketData.supplyBalance <= BigInt(0)}
        onClick={onChangeUserPosition}
        {...styles}
      >
        Withdraw
      </Button>

      <ModalsLayout
        isHiddenClose
        isOpen={isOpen}
        onClose={onClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <WalletConnect closeModal={onWalletConnectClose} />
      </ModalsLayout>

      <ModalsLayout
        isHiddenClose
        isOpen={openModal}
        onClose={onWithdrawClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <WithdrawWidget marketData={marketData} />
      </ModalsLayout>
    </>
  );
};

export default WithdrawButton;
