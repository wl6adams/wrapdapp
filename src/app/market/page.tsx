import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { TableMarket } from '@/modules/market/table';
import { Page } from '@/widgets/page/ui';

const Chart = dynamic(() => import('@/modules/market/chart'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'DeFi Market Analytics - Earn With Your Crypto Assets | Compound',

  description:
    'DeFi Market Insights on Compound. Lending rates, Borrowing Trends and DeFi Analytics in Real-Time on the Leading Crypto Lending and Borrowing Platform.',
};

export default async function Market() {
  return (
    <Page>
      <Chart title='Markets' />

      <TableMarket />
    </Page>
  );
}
