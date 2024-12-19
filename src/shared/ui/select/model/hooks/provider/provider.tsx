import { createContext, useContext } from 'react';

import type { CustomOptionsType } from '../../types';

interface SelectContextProps {
  isOpen: boolean;

  selected: CustomOptionsType;

  onSelected: (selected: CustomOptionsType) => void;

  onClose: () => void;

  onOpen: () => void;
}

export const SelectContext = createContext<SelectContextProps>(null!);

export const useSelectContext = () => {
  const props = useContext(SelectContext);

  if (!props) {
    throw new Error('No popover context found! ');
  }

  return props;
};
