import React, { FC, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import Widget from '@/modules/widget/widget';
import { View } from '@/shared/ui/view';
import { TableData } from '@/shared/web3/types';
import { useStore } from '@/store';
import { ModalsLayout } from '@/widgets/modal';

interface BorrowModalProps {
  marketData: TableData;

  isOpen: boolean;

  onOpen: () => void;

  onClose: () => void;

  onAfterTransaction?: () => void;
}

const BorrowModal: FC<BorrowModalProps> = ({
  isOpen,
  marketData,
  onAfterTransaction,
  onOpen,
  onClose,
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { setShowStep, setSelectedMarketData, setLiqRisk } = useStore();

  const { address } = useAccount();

  const isWalletConnect = useMemo(() => {
    if (!isOpen) return false;

    if (!address) return true;

    return !!address && openModal;
  }, [isOpen, address, openModal]);

  const isWidget = useMemo(() => {
    if (!isOpen) return false;

    return !!address && !openModal;
  }, [isOpen, address, openModal]);

  const onChangeWallet = () => {
    setOpenModal(true);
  };

  const onModalWidgetClose = () => {
    onAfterTransaction?.();

    setLiqRisk(1.5);

    setShowStep(1);

    setOpenModal(false);

    onClose();
  };

  const onWalletConnectClose = () => {
    setSelectedMarketData(marketData);

    setOpenModal(false);

    onOpen();
  };

  const onCloseModal = () => {
    if (isWalletConnect) {
      setOpenModal(false);

      onClose();

      return;
    }

    onModalWidgetClose();
  };

  useEffect(() => {
    if (!address) {
      setOpenModal(false);

      setShowStep(1);
    }
  }, [address, setShowStep]);

  return (
    <ModalsLayout
      isHiddenClose
      isOpen={isOpen}
      onClose={onCloseModal}
      bgWhite='brand.150'
      bgBlack='brand.750'
    >
      <View.Condition if={isWalletConnect}>
        <WalletConnect closeModal={onWalletConnectClose} />
      </View.Condition>

      <View.Condition if={isWidget}>
        <Widget openWalletConnect={onChangeWallet} />
      </View.Condition>
    </ModalsLayout>
  );
};

export { BorrowModal };
