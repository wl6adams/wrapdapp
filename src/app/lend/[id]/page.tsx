import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Grid } from '@chakra-ui/react';

import MarketRates from '@/modules/lend/market-rates/market-rates';
import TokenInfo from '@/modules/lend/token-info/token-info';
import { NetworksNames } from '@/shared/web3/chainConfig';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { Page } from '@/widgets/page/ui';

const LendingTopSection = dynamic(
  () => import('@/modules/lend/lending-top-section/lending-top-section'),
  {
    ssr: false,
  }
);

const LendingCalculator = dynamic(
  () => import('@/modules/lend/lending-calculator/lending-calculator'),
  {
    ssr: false,
  }
);

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const [asset, chainId] = params.id.split('-');

  const tokenName = asset.toUpperCase();

  const chainName = (
    NetworksNames[Number(chainId)] || NetworksNames[DEFAULT_CHAIN_ID]
  ).toUpperCase();

  return {
    title: `${tokenName} Lending - ${tokenName} on ${chainName} Lending | Compound`,

    description: `Best ${tokenName} Lending Rates. Earn Interest on Your ${tokenName} on ${chainName} Continuously. No Lockups, Secure Transactions. User-Friendly Interface.`,
  };
}

export default function LendId() {
  return (
    <Page>
      <Grid
        gap='1rem'
        m={{
          base: '1rem 0 3rem',
          lg: '1rem 0 7.5rem',
        }}
      >
        <Link
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1E1C24',
            width: '109px',
            height: '37px',
            gap: '8px',
            borderRadius: '100px',
          }}
          href='/lend'
        >
          <Image
            width={16}
            height={16}
            style={{
              flexShrink: 0,
              transform: 'rotate(280deg)',
            }}
            src='/chevron.svg'
            alt='chevron'
          />
          Markets
        </Link>

        <LendingTopSection />

        <TokenInfo />

        <LendingCalculator />

        <MarketRates />
      </Grid>
    </Page>
  );
}
