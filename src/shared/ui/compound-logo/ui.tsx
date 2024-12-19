import Image from 'next/image';
import { Flex, Text } from '@chakra-ui/react';

function CompoundLogo({
  networkName,
  justifyContent,
}: {
  networkName?: string;
  justifyContent?: any;
}) {
  return (
    <Flex
      alignItems='center'
      justifyContent={justifyContent}
      gap={2}
    >
      {networkName ? (
        <Image
          width={24}
          height={24}
          loading='lazy'
          src={`/tokenNetwork/${networkName}.svg`}
          alt={networkName}
        />
      ) : (
        <Image
          width={24}
          height={24}
          src='/logo.svg'
          alt='logo'
        />
      )}

      <Text>{networkName ? networkName : 'Compound'}</Text>
    </Flex>
  );
}

export { CompoundLogo };
