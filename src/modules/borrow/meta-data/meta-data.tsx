'use client';

import { useEffect } from 'react';

import { NetworksNames } from '@/shared/web3/chainConfig';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { useStore } from '@/store';

const BorrowMetaData = () => {
  const { selectedMarketData } = useStore();

  useEffect(() => {
    if (selectedMarketData) {
      const collateralsTotalSupply = selectedMarketData.configuratorData
        .map(({ symbol }) => symbol)
        .join(', ');

      document.title = `Borrow ${selectedMarketData?.asset} on ${NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]} Against ${collateralsTotalSupply} | Compound`;

      const descriptionMeta = document.querySelector("meta[name='description']")!;

      descriptionMeta?.setAttribute(
        'content',
        `Borrow ${selectedMarketData?.asset} Against Your Assets With Competitive Interest Rates. Don't Sell Crypto - Borrow ${selectedMarketData?.asset} on ${NetworksNames[selectedMarketData?.chainId || DEFAULT_CHAIN_ID]} Against ${collateralsTotalSupply} and More Assets.`
      );
    }
  }, [selectedMarketData]);

  return null;
};

export { BorrowMetaData };
