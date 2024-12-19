'use client';

import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Skeleton } from '@chakra-ui/react';

import Borrowing from '@/modules/dashboard/borrowing/borrowing';
import Lending from '@/modules/dashboard/lending/lending';
import Transactions from '@/modules/dashboard/transactions/transactions';
import { Preloader } from '@/shared/ui/preloader';
import getUserTransactions from '@/shared/web3/hook/getUserTransactions';
import { useDashboardStore } from '@/store/dashboard';

const Dashboard = () => {
  const { address } = useAccount();

  const { getTransactions } = getUserTransactions();

  const { viewPage, isLoading, setIsLoading } = useDashboardStore();

  const VIEW_PAGE = useMemo(() => {
    switch (viewPage) {
      case 0:
        return <Lending />;

      case 1:
        return <Borrowing />;

      case 2:
        return <Transactions />;

      default:
        return null;
    }
  }, [viewPage]);

  useEffect(() => {
    if (!address) {
      setIsLoading(true);

      return;
    }
    setIsLoading(false);
  }, [viewPage, address, setIsLoading]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
      getTransactions();
    }
  }, []);

  return (
    <>
      {!isLoading && <Preloader />}

      <Skeleton
        borderRadius='16px'
        isLoaded={isLoading}
        position='relative'
        zIndex={1}
      >
        {VIEW_PAGE}
      </Skeleton>
    </>
  );
};

export default Dashboard;
