import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Grid, Show } from '@chakra-ui/react';

import MarketRates from '@/modules/market/details/market-rates/market-rates';
import { DesktopTable, MobileTable } from '@/modules/market/details/specific-market';
import TokenInfo from '@/modules/market/details/token-info/token-info';
import ScanLink from '@/modules/market/scanLink/scanLink';
import { NetworksNames } from '@/shared/web3/chainConfig';
import { DEFAULT_CHAIN_ID } from '@/shared/web3/wagmiConfig';
import { Page } from '@/widgets/page/ui';

const TopSection = dynamic(
  () => import('@/modules/market/details/details-top-section/details-top-section'),
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
    title: `${tokenName} on ${chainName} Market Insights | Compound`,

    description: `Explore ${tokenName} on ${chainName} Market Analytics on Compound Lending & Borrowing Platform. Monitor Lending Rates, Borrowing Statistics & Make Informed Decisions`,
  };
}

export default async function MarketId() {
  return (
    <Page>
      <Grid
        gap={{ base: '1.5rem', lg: '1rem' }}
        m={{
          base: '1rem 0 3rem',
          lg: '1rem 0 7.5rem',
        }}
      >
        <Box>
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
            href='/market'
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
        </Box>

        <TopSection />

        <TokenInfo />

        <MarketRates />

        <Show breakpoint='(min-width: 1250px)'>
          <DesktopTable />
        </Show>

        <Show breakpoint='(max-width: 1250px)'>
          <Grid
            gridTemplateColumns='1fr'
            rowGap='10px'
          >
            <MobileTable />
          </Grid>
        </Show>

        <ScanLink />
      </Grid>
    </Page>
  );
}
