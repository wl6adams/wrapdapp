import { FC } from 'react';
import { Flex } from '@chakra-ui/react';

import { SortIconDown } from '@/shared/chakra-ui/icons';

import { useSelectContext } from '../../model/hooks/provider';
import type { SelectSortIconDownProps } from '../../model/types';

const SelectSortValueIconDown: FC<SelectSortIconDownProps> = ({ ...props }) => {
  const { isOpen, selected, onOpen, onClose } = useSelectContext();

  return (
    <Flex
      bg='brand.400'
      p='8px 8px 8px 16px'
      borderRadius='8px'
      cursor='pointer'
      alignItems='center'
      gap='8px'
      textTransform='capitalize'
      onClick={!isOpen ? onOpen : onClose}
      {...props}
    >
      {selected.name}{' '}
      <SortIconDown
        width='12px'
        height='10px'
        color='#fff'
        style={{ transform: `rotate(${isOpen ? 180 : 0}deg)`, transition: 'all .3s' }}
      />
    </Flex>
  );
};

export { SelectSortValueIconDown };
