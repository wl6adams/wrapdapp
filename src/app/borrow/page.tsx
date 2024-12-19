import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { TableMarket } from '@/modules/borrow/table';
import { Page } from '@/widgets/page/ui';

const ChartBorrow = dynamic(() => import('@/modules/borrow/chart/chart'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Borrow Crypto - Best Interest Rates | Compound',

  description:
    'Borrow Crypto Instantly Against Your Assets Without Selling. Competitive Rates and Secure Transactions on Compound - Leading Crypto Borrowing Platform.',
};

export default async function Borrow() {
  return (
    <Page>
      <ChartBorrow title='Borrow' />

      <TableMarket />
    </Page>
  );
}
