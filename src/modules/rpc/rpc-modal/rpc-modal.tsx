import React, { useCallback, useMemo, useState } from 'react';
import { Button, Collapse, Flex, Grid } from '@chakra-ui/react';

import { RPCItem } from '@/modules/rpc/rpc-modal/ui/rpc-item';
import { RpcSwitcher } from '@/modules/rpc/rpc-modal/ui/rpc-switcher';
import { arraysEqual } from '@/shared/lib/utils';
import { Each } from '@/shared/ui/each';
import { CustomRPCListType, useRPCStore } from '@/store/rpc';

const RPCModal = () => {
  const {
    publicRPC,
    myWalletRPC,
    customRPC,
    customRPCList,

    setPublicRPC,
    setMyWalletRPC,
    setCustomRPC,
    setCustomRPCList,
  } = useRPCStore();

  const [initCustomRPCList, setInitCustomRPCList] = useState<CustomRPCListType[]>(customRPCList);

  const onChange = useCallback((rawValue: string, name: string, isArchive: boolean) => {
    setInitCustomRPCList((prevList) =>
      prevList.map((item) =>
        item.name === name ? { ...item, value: rawValue, isArchiveNode: isArchive } : item
      )
    );
  }, []);

  const onSave = useCallback(() => {
    setCustomRPCList(initCustomRPCList);
  }, [initCustomRPCList]);

  const isDisabled = useMemo(
    () => arraysEqual(customRPCList, initCustomRPCList),
    [customRPCList, initCustomRPCList]
  );

  return (
    <Flex
      p='1.5rem'
      gap='1rem'
      borderRadius='1rem'
      border='1px solid'
      borderColor='brand.500'
      bg='brand.750'
      flexDirection='column'
    >
      <RpcSwitcher
        title='Public RPC'
        isChecked={publicRPC}
        onChange={() => setPublicRPC(!publicRPC)}
      />

      <RpcSwitcher
        title='My wallet RPC'
        isChecked={myWalletRPC}
        onChange={() => setMyWalletRPC(!myWalletRPC)}
      />

      <RpcSwitcher
        title='Custom RPC'
        isChecked={customRPC}
        onChange={() => setCustomRPC(!customRPC)}
      />

      <Collapse in={customRPC}>
        <Grid gap='10px'>
          <Each
            data={initCustomRPCList}
            render={({ value, name, icon, id }) => (
              <RPCItem
                name={name}
                id={id}
                icon={icon}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </Grid>

        <Flex
          w='100%'
          mt='1rem'
          justifyContent='flex-end'
        >
          <Button
            w='100px'
            h='42px'
            color='brand.150'
            borderRadius='50px'
            isDisabled={isDisabled}
            onClick={onSave}
          >
            Save
          </Button>
        </Flex>
      </Collapse>
    </Flex>
  );
};

export { RPCModal };
