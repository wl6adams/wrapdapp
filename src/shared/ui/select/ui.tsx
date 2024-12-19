import { createRef, FC, RefObject, useEffect, useState } from 'react';
import { Flex, useDisclosure } from '@chakra-ui/react';

import { DirectionType } from '@/modules/market/table';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { TableData } from '@/shared/web3/types';

import { SelectContext } from './model/hooks/provider';
import type { CustomOptionsType, SelectProps } from './model/types';
import { SelectList } from './ui/select-list';
import { SelectListItem } from './ui/select-list-item';
import { SelectSortValueIconDown } from './ui/select-sort-value-icon-down';

const SelectRadioComponent: FC<SelectProps> = ({
  defaultSelected,
  onRequestSort,
  onChangeUtility,
  onChangeMarket,
  reset,
  children,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selected, setSelected] = useState<CustomOptionsType>(defaultSelected);

  const ref: RefObject<HTMLDivElement> = createRef();

  const onSelected = (selected: CustomOptionsType) => {
    setSelected(selected);
  };

  useEffect(() => {
    if (reset) setSelected(defaultSelected);
  }, [defaultSelected, reset]);

  useEffect(() => {
    if (!selected) return;

    if (onChangeMarket) {
      onChangeMarket(selected.value);

      return;
    }

    if (selected?.isUtility) {
      onChangeUtility?.(selected.value as DirectionType);

      return;
    }

    onRequestSort?.(selected.value as keyof TableData);
  }, [onChangeMarket, onChangeUtility, onRequestSort, selected]);

  useClickOutside(ref, onClose);

  return (
    <SelectContext.Provider value={{ selected, isOpen, onOpen, onClose, onSelected }}>
      <Flex
        ref={ref}
        position='relative'
        {...props}
      >
        {children}
      </Flex>
    </SelectContext.Provider>
  );
};

const SelectRadio = Object.assign(SelectRadioComponent, {
  Icon: SelectSortValueIconDown,

  List: SelectList,

  ListItem: SelectListItem,
});

export { SelectRadio };
