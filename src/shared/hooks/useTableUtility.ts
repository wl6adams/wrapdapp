import { useMemo } from 'react';

import { TableData } from '@/shared/web3/types';

interface TableUtilityProps {
  headers: { title: string; sortId?: keyof TableData }[];

  tableData?: TableData[];
}

interface TableUtilityReturn {
  title: string;

  isColored: boolean;
}

const useTableUtility = ({ headers, tableData }: TableUtilityProps): TableUtilityReturn[][] => {
  const headersLength = headers.length;

  const calculateColoredColumns = (utility: number, headersLength: number) => {
    return Math.ceil((utility / 100) * headersLength);
  };

  return useMemo(() => {
    if (!tableData) return [];

    return tableData?.map((row) => {
      const columnsToColor = calculateColoredColumns(row.utility, headersLength);

      return headers.map((header, index) => ({
        title: header.title,
        isColored: index < columnsToColor,
      }));
    });
  }, [tableData, headers, headersLength]);
};

export { useTableUtility };
