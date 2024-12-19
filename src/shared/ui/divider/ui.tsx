import React, { FC } from 'react';
import { Box } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

interface DividerProps extends HTMLChakraProps<'div'> {}

const Divider: FC<DividerProps> = (props) => (
  <Box
    w='100%'
    h='1px'
    bg='brand.linearGradient.100'
    {...props}
  />
);

export { Divider };
