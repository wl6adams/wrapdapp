import { memo, PropsWithChildren } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

interface ITableHeader extends HTMLChakraProps<'div'>, PropsWithChildren {}
interface ITableBody extends HTMLChakraProps<'div'>, PropsWithChildren {}
interface IRow extends HTMLChakraProps<'div'>, PropsWithChildren {}
interface ICell extends HTMLChakraProps<'div'>, PropsWithChildren {}
interface ITable extends HTMLChakraProps<'div'>, PropsWithChildren {}

const TableHeader = memo(({ children, ...props }: ITableHeader) => {
  return (
    <Flex
      w='100%'
      {...props}
    >
      {children}
    </Flex>
  );
});

const TableBody = memo(({ children, ...props }: ITableBody) => {
  return (
    <Flex
      w='100%'
      {...props}
    >
      {children}
    </Flex>
  );
});

const Row = memo(({ children, ...props }: IRow) => {
  return (
    <Flex
      alignItems='center'
      position='relative'
      borderRadius='8px'
      border='1px solid'
      borderColor='brand.600'
      backgroundColor='brand.400'
      {...props}
    >
      {children}
    </Flex>
  );
});

const Cell = memo(({ children, ...props }: ICell) => {
  return (
    <Box
      flex={1}
      p='10px'
      textAlign='start'
      {...props}
    >
      {children}
    </Box>
  );
});

const Table = memo(({ children, ...props }: ITable) => {
  return (
    <Flex
      flexDirection='column'
      bg='brand.750'
      p='1rem 1.5rem'
      borderRadius='0.5rem'
      w='100%'
      {...props}
    >
      {children}
    </Flex>
  );
});

export { Cell, Row, Table, TableBody, TableHeader };
