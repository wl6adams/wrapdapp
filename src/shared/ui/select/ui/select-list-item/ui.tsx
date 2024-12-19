import { FC } from 'react';
import { Box, Flex } from '@chakra-ui/react';

import { useSelectContext } from '../../model/hooks/provider';
import { CustomOptionsType, SelectListItemProps } from '../../model/types';

const SelectListItem: FC<SelectListItemProps> = ({ option, children, onClick, ...props }) => {
  const { onSelected, onClose } = useSelectContext();

  const onSelect = (value: CustomOptionsType) => {
    onSelected(value);

    onClick();

    onClose();
  };

  return (
    <Box
      borderBottom='1px solid'
      borderColor='gray.600'
      _last={{ borderBottom: 'none' }}
    >
      <Flex
        w='100%'
        alignItems='center'
        onClick={() => onSelect(option)}
        {...props}
      >
        <Box
          w={4}
          h={4}
          flexShrink={0}
          borderRadius='50%'
          border={option.isActive ? '4px solid' : '2px solid'}
          borderColor={option.isActive ? 'brand.100' : 'brand.1575'}
        />

        {children}
      </Flex>
    </Box>
  );
};

export { SelectListItem };
