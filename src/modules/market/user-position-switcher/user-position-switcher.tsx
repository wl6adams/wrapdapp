import { useEffect, useState } from 'react';
import { useStore } from 'src/store';
import { useAccount } from 'wagmi';
import { Flex, FormLabel, Switch, useDisclosure } from '@chakra-ui/react';

import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { ModalsLayout } from '@/widgets/modal';

const UserPositionSwitcher = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setIsMyWallet } = useStore();

  const [isChecked, setIsChecked] = useState(false);

  const { address, isConnected } = useAccount();

  const handleChangeUserPosition = () => {
    if (!address) {
      onOpen();
    } else {
      setIsChecked(!isChecked);
    }

    if (!address) {
      onOpen();
    } else {
      setIsMyWallet(!isChecked);
      setIsChecked(!isChecked);
    }
  };
  useEffect(() => {
    if (address && isConnected) {
      onClose();
    }
  }, [address, address]);
  return (
    <Flex
      alignItems='center'
      justifySelf='flex-end'
    >
      <FormLabel
        htmlFor='userPosition'
        m='0 10px 0 0'
        whiteSpace='nowrap'
      >
        Only my Positions
      </FormLabel>
      <Switch
        id='userPosition'
        isChecked={isChecked}
        onChange={handleChangeUserPosition}
      />

      <ModalsLayout
        isHiddenClose
        isOpen={isOpen}
        onClose={onClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <WalletConnect
          closeModal={() => {
            onClose();
            setIsMyWallet(!isChecked);
            setIsChecked(!isChecked);
          }}
        />
      </ModalsLayout>
    </Flex>
  );
};

export default UserPositionSwitcher;
