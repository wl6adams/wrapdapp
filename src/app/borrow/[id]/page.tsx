import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Grid, Show } from '@chakra-ui/react';

import MarketRates from '@/modules/borrow/market-rates/market-rates';
import { BorrowMetaData } from '@/modules/borrow/meta-data/meta-data';
import ScanLink from '@/modules/borrow/scanLink/scanLink';
import { DesktopTable, MobileTable } from '@/modules/borrow/specific-market';
import TokenInfo from '@/modules/borrow/token-info/token-info';
import { Page } from '@/widgets/page/ui';

const BorrowTopSection = dynamic(
  () => import('@/modules/borrow/borrow-top-section/borrow-top-section'),
  {
    ssr: false,
  }
);

export default function BorrowId() {
  return (
    <Page>
      <BorrowMetaData />

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
            href='/borrow'
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

        <BorrowTopSection />

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
