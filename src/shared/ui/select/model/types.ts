import { HTMLChakraProps } from '@chakra-ui/system';

import { DirectionType } from '@/modules/market/table';
import { TableData } from '@/shared/web3/types';

interface CustomOptionsType {
  value: string;

  name: string;

  isActive: boolean;

  isUtility?: boolean;
}

interface SelectProps extends HTMLChakraProps<'div'> {
  defaultSelected: CustomOptionsType;

  reset?: boolean;

  onRequestSort?: (key: keyof TableData) => void;

  onChangeUtility?: (key: DirectionType) => void;

  onChangeMarket?: (market: string) => void;
}

interface SelectSortIconDownProps extends HTMLChakraProps<'div'> {}

interface SelectListProps extends HTMLChakraProps<'div'> {}

interface SelectListItemProps extends HTMLChakraProps<'div'> {
  option: CustomOptionsType;

  onClick: () => void;
}

export type {
  CustomOptionsType,
  SelectListItemProps,
  SelectListProps,
  SelectProps,
  SelectSortIconDownProps,
};
