import { FC } from 'react';
import { Box, Collapse, Flex } from '@chakra-ui/react';

import { useSelectContext } from '../../model/hooks/provider';
import { SelectListProps } from '../../model/types';

const SelectList: FC<SelectListProps> = ({ children, ...props }) => {
  const { isOpen } = useSelectContext();

  return (
    <Collapse in={isOpen}>
      <Box
        position='absolute'
        top='60px'
        zIndex={999}
        bg='brand.400'
        p='8px 16px'
        borderRadius='8px'
        border='1px solid'
        borderColor='brand.600'
        {...props}
      >
        <Flex flexDirection='column'>{children}</Flex>
      </Box>
    </Collapse>
  );
};

export { SelectList };
