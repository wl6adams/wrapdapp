'use client';

import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

import { useStore } from '@/modules/supply-widget/store';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { View } from '@/shared/ui/view';
import { TableData } from '@/shared/web3/types';
import { ModalsLayout } from '@/widgets/modal';

const SupplyWidget = dynamic(() => import('@/modules/supply-widget/supply-widget'), {
  ssr: false,
});

interface LendModalProps {
  marketData: TableData;

  isOpen: boolean;

  onClose: () => void;
}

const LendModal: FC<LendModalProps> = ({ marketData, isOpen, onClose }) => {
  const { address } = useAccount();

  const { setShowStep, setSelectedMarketData } = useStore();

  const onModalWidgetClose = () => {
    onClose();
  };

  const onConnectedWallet = (isConnected: boolean = false) => {
    if (isConnected) {
      setShowStep(1);

      setSelectedMarketData(marketData);

      return;
    }
  };

  return (
    <>
      <View.Condition if={!address}>
        <ModalsLayout
          isHiddenClose
          isOpen={isOpen}
          onClose={onClose}
          bgWhite='brand.150'
          bgBlack='brand.750'
        >
          <WalletConnect onConnectedWallet={onConnectedWallet} />
        </ModalsLayout>
      </View.Condition>

      <View.Condition if={!!address}>
        <ModalsLayout
          isHiddenClose
          isOpen={isOpen}
          onClose={onModalWidgetClose}
          bgWhite='brand.150'
          bgBlack='brand.750'
        >
          <SupplyWidget />
        </ModalsLayout>
      </View.Condition>
    </>
  );
};

export default LendModal;
