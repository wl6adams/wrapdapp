import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { TableMarket } from '@/modules/lend/table';
import { Page } from '@/widgets/page/ui';

const ChartLend = dynamic(() => import('@/modules/lend/chart/chart'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Crypto Lending | Compound',
  description:
    'Best Crypto Lending APY: Leverage Your Crypto Holdings For Maximum Potential. Secure and Tailored For Both Crypto Enthusiasts and Seasoned Investors.',
};

export default async function Lend() {
  return (
    <Page>
      <ChartLend title='Lend' />

      <TableMarket />
    </Page>
  );
}
