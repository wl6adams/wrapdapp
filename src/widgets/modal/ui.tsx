import { PropsWithChildren } from 'react';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';

import { View } from '@/shared/ui/view';

type WalletConnectProps = PropsWithChildren<{
  isOpen: boolean;

  onClose: () => void;

  bgWhite: string;

  bgBlack: string;

  isHiddenClose?: boolean;
}>;

function ModalsLayout({
  isOpen,
  onClose,
  bgWhite,
  bgBlack,
  isHiddenClose = false,
  children,
}: WalletConnectProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay bg='#05070bb3' />

      <ModalContent
        p='0'
        borderRadius='20px'
        width={{ base: '350px', lg: '450px' }}
        maxW={{ base: '90%', sm: '100%' }}
        background={bgWhite}
        backgroundPosition='top'
        backgroundSize='cover'
        _dark={{
          background: bgBlack,
          backgroundPosition: 'top',
          backgroundSize: 'cover',
        }}
      >
        <View.Condition if={!isHiddenClose}>
          <ModalCloseButton
            color='brand.700'
            w='24px'
            h='24px'
            bg='none'
            fontSize='12px'
            top='20px'
            right='20px'
          />
        </View.Condition>

        <ModalBody p='0'>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}

export { ModalsLayout };
