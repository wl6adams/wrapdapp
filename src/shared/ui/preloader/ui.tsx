import Lottie from 'react-lottie';
import { Flex } from '@chakra-ui/react';

import animationData from '../../../../public/compound.json';

const Preloader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  return (
    <Flex
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        background: '#000',
        width: '100%',
        height: '100vh',
        zIndex: '9999',
      }}
      alignItems='center'
      justifyContent='center'
    >
      <Lottie
        options={defaultOptions}
        height={120}
        width={120}
      />
    </Flex>
  );
};

export { Preloader };
