import { useTransactionReceipt, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { removeSepoliaFromTable } from '@/shared/lib/utils';
import { TableData } from '@/shared/web3/types';

export const useApproveToken = () => {
  const {
    writeContract: approveToken,
    data,
    isError: isErrorApproveToken,
    error: errorApproveToken,
    isPending: isPendingApproveToke,
  } = useWriteContract();

  const { isLoading: isLoadingApproveToken } = useTransactionReceipt({
    hash: data,
  });
  const { isLoading: isLoadingApprove, isSuccess: isSuccessApproveToken } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingApprove =
    isLoadingApprove || isLoadingApproveToken || isPendingApproveToke;

  return {
    approveToken,
    isLoadingApprove,
    isLoadingApproveToken,
    isPendingApproveToke,
    isAbsoluteLoadingApprove,
    isSuccessApproveToken,
    isErrorApproveToken,
    errorApproveToken,
    approveResponse: data,
  };
};

export const useBuyTokensWithETH = () => {
  const {
    writeContract: buyTokensWithETH,
    data,
    isError: isErrorBuyTokensWithETH,
    error: errorBuyTokensWithETH,
    isPending: isPendingBuyWithEth,
  } = useWriteContract();

  const { isLoading: isLoadingBuyTokensWithETH } = useTransactionReceipt({
    hash: data,
  });

  const { isLoading: isLoadingWithETH, isSuccess: isSuccessBuyTokensWithETH } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingBuy = isLoadingBuyTokensWithETH || isLoadingWithETH || isPendingBuyWithEth;

  return {
    buyTokensWithETH,
    isLoadingBuyTokensWithETH,
    isLoadingWithETH,
    isPendingBuyWithEth,
    isSuccessBuyTokensWithETH,
    isAbsoluteLoadingBuy,
    isErrorBuyTokensWithETH,
    errorBuyTokensWithETH,
    txHash: data,
  };
};

export const useBuyTokensWithToken = () => {
  const {
    writeContract: buyTokensWithToken,
    data,
    isError: isErrorBuyTokensWithToken,
    error: errorBuyTokensWithToken,
    isPending: isPendingBuyWithToken,
  } = useWriteContract();

  const { isLoading: isLoadingBuyTokensWithToken } = useTransactionReceipt({
    hash: data,
  });

  const { isLoading: isLoadingWithToken, isSuccess: isSuccessBuyTokensWithToken } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingBuyToken =
    isLoadingBuyTokensWithToken || isLoadingWithToken || isPendingBuyWithToken;

  return {
    buyTokensWithToken,
    isLoadingBuyTokensWithToken,
    isLoadingWithToken,
    isPendingBuyWithToken,
    isSuccessBuyTokensWithToken,
    isAbsoluteLoadingBuyToken,
    isErrorBuyTokensWithToken,
    errorBuyTokensWithToken,
    txHash: data,
  };
};

export const useBorrowTokens = () => {
  const {
    writeContract: borrowTokens,
    data,
    isError: isErrorBorrowTokens,
    error: errorBorrowTokens,
    isPending: isPendingBorrowTokens,
  } = useWriteContract();

  const { isLoading: isLoadingBorrowTokens } = useTransactionReceipt({
    hash: data,
  });

  const { isLoading: isLoadingBorrowTokensAll, isSuccess: isSuccessBorrowTokens } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingBorrowTokens =
    isLoadingBorrowTokens || isLoadingBorrowTokensAll || isPendingBorrowTokens;

  return {
    borrowTokens,
    isErrorBorrowTokens,
    errorBorrowTokens,
    isSuccessBorrowTokens,
    isPendingBorrowTokens,
    isLoadingBorrowTokens,
    isAbsoluteLoadingBorrowTokens,
    txHash: data,
  };
};

export const useWithdraw = () => {
  const {
    writeContract: withdraw,
    data,
    isError: isErrorUseWithdraw,
    error: errorUseWithdraw,
    isPending: isPendingUseWithdraw,
  } = useWriteContract();

  const { isLoading: isLoadingUseWithdraw } = useTransactionReceipt({
    hash: data,
  });

  const { isLoading: isLoadingUseWithdrawAll, isSuccess: isSuccessUseWithdraw } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingBorrowTokens =
    isLoadingUseWithdraw || isLoadingUseWithdrawAll || isPendingUseWithdraw;

  return {
    withdraw,
    isErrorUseWithdraw,
    errorUseWithdraw,
    isSuccessUseWithdraw,
    isPendingUseWithdraw,
    isLoadingUseWithdraw,
    isAbsoluteLoadingBorrowTokens,
    txHash: data,
  };
};

export const useClaimCOMP = () => {
  const {
    writeContract: claimCOMP,
    data,
    isError: isErrorClaimCOMP,
    error: errorClaimCOMP,
    isPending: isPendingClaimCOMP,
  } = useWriteContract();

  const { isLoading: isLoadingClaimCOMP } = useTransactionReceipt({
    hash: data,
  });

  const { isLoading: isLoadingClaimCOMPAll, isSuccess: isSuccessClaimCOMP } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const isAbsoluteLoadingClaimCOMP =
    isLoadingClaimCOMP || isLoadingClaimCOMPAll || isPendingClaimCOMP;

  return {
    claimCOMP,
    isErrorClaimCOMP,
    errorClaimCOMP,
    isPendingClaimCOMP,
    isSuccessClaimCOMP,
    isAbsoluteLoadingClaimCOMP,
    txHash: data,
  };
};

export const fetchData = async ({
  setIsLoaded,
  setInitialData,
  setData,
  getTableData,
}: {
  setIsLoaded: (bool: boolean) => void;
  setInitialData: (data: TableData[]) => void;
  setData: (data: TableData[]) => void;
  getTableData: () => Promise<TableData[] | undefined>;
}) => {
  try {
    setIsLoaded(false);
    const response = await getTableData();
    if (response?.length) {
      const filteredResponse = removeSepoliaFromTable(response);
      setInitialData(filteredResponse);
      setData(filteredResponse);
    }
  } finally {
    setIsLoaded(true);
  }
};
