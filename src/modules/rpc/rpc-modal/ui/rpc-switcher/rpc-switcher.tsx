import React, { useId } from 'react';
import { Flex, Switch, Text } from '@chakra-ui/react';

interface RpcSwitcherProps {
  title: string;

  isChecked: boolean;

  onChange: () => void;
}

const RpcSwitcher = ({ title, isChecked, onChange }: RpcSwitcherProps) => {
  return (
    <Flex
      minH='70px'
      p='1.25rem'
      borderRadius='0.5rem'
      bg='brand.1675'
      border='1px solid'
      borderColor='brand.500'
      alignItems='center'
      justifyContent='space-between'
    >
      <Text size='small16500140'>{title}</Text>

      <Switch
        id={useId()}
        isChecked={isChecked}
        onChange={onChange}
      />
    </Flex>
  );
};

export { RpcSwitcher };
