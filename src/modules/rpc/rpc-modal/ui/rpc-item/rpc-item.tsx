import React, { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';

import { CloseIcon } from '@/shared/chakra-ui/icons';
import { useDebounceString } from '@/shared/hooks/useDebounce';
import { checkRPC } from '@/shared/lib/utils';

interface RPCItemProps {
  icon: string;

  id: number;

  value: string;

  name: string;

  onChange: (rawValue: string, name: string, isArchive: boolean) => void;
}

const RPCItem = memo(({ icon, value, name, onChange, id }: RPCItemProps) => {
  const [inputState, setInputState] = useState('');

  const [isInvalid, setIsInvalid] = useState(false);

  const { address } = useAccount();

  useEffect(() => {
    setInputState(value);
  }, []);

  const inputDebounce = useDebounceString(inputState, 300);

  const onChangeRPCInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    setInputState(rawValue);
  };

  useEffect(() => {
    if (!!inputDebounce && address) {
      (async () => {
        const check = await checkRPC(inputDebounce, id, address);
        if (check.isGoodRpc) {
          setIsInvalid(false);
          onChange(inputDebounce, name, false);
        } else {
          setIsInvalid(true);
        }
        if (check.isGoodArchiveRpc) {
          onChange(inputDebounce, name, true);
        }
      })();
    }
  }, [inputDebounce, address]);

  const onClickRpcButton = async () => {
    if (!!inputDebounce) {
      setIsInvalid(false);
      setInputState('');
    } else {
      const rpc = await navigator.clipboard.readText();

      setInputState(rpc);
    }
  };
  return (
    <>
      <Flex
        p='6px'
        gap='10px'
        bg='brand.400'
        border='1px solid'
        borderRadius='9px'
        alignItems='center'
        borderColor={isInvalid ? 'brand.1275' : 'brand.1700'}
        h='48px'
      >
        <Box
          p='6px'
          borderRadius='6px'
          bg='brand.1725'
          border='1px solid'
          borderColor='brand.1750'
        >
          <Image
            width={22}
            height={22}
            src={icon}
            alt={name}
          />
        </Box>

        <Input
          border='0px'
          h='22px'
          bg='none'
          _focus={{ border: 'none', boxShadow: 'none' }}
          outline='none'
          fontSize='1rem'
          p='0'
          placeholder='https://custom-rpc.com'
          value={inputState}
          onChange={(event) => onChangeRPCInput(event)}
        />

        <Button
          variant='rpcButton'
          onClick={onClickRpcButton}
        >
          {!!inputState ? <CloseIcon /> : 'Paste'}
        </Button>
      </Flex>

      {isInvalid && (
        <Text
          color='brand.1275'
          size='large12500140'
        >
          Invalid URL will display as text link. Check link and try again.
        </Text>
      )}
    </>
  );
});

export { RPCItem };
