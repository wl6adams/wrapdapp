import { createRef, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { View } from 'src/shared/ui/view';
import { useAccount, useSwitchChain } from 'wagmi';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Button, Collapse, Flex, Grid, Text, useDisclosure } from '@chakra-ui/react';

import { RewardsABI } from '@/shared/web3/abi/RewardsABI';
import { MARKET_ADDRESSES, NetworksNames, REWARDS_ADDRESSES } from '@/shared/web3/config';
import { useClaimCOMP } from '@/shared/web3/hook';
import { CompTotalData } from '@/shared/web3/types';

const ClaimComp = ({
  allCompData,
  isToggleOpen,
  getData,
}: {
  allCompData: CompTotalData[] | undefined;
  isToggleOpen?: boolean;
  getData: () => void;
}) => {
  const ref: React.RefObject<HTMLDivElement> = createRef();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { chainId, address } = useAccount();

  const { switchChainAsync } = useSwitchChain();

  const [isSuccessful, setIsSuccessful] = useState(false);

  const [isLessThan767] = useMediaQuery('(max-width: 767px)');

  const { claimCOMP, isAbsoluteLoadingClaimCOMP } = useClaimCOMP();

  const onClickOutside = (event: MouseEvent) => {
    if (ref) {
      const cur = ref.current;
      if (cur && !cur.contains(event.target as Node)) {
        onClose();
      }
    }
  };

  const getNetworkComp = useCallback(
    (networkId: number): number => {
      if (!allCompData) {
        return 0;
      }

      const calc = allCompData
        .filter(({ chainId }) => chainId === networkId)
        .map(({ result }) => result);

      if (calc.length) {
        const result = calc.reduce((a, b) => a + b);

        return result;
      }
      return 0;
    },
    [allCompData]
  );

  const claim = () => {
    if (!chainId || !address || !allCompData) {
      return;
    }

    const rewardContactAddress = REWARDS_ADDRESSES[chainId];

    const result = allCompData.filter(
      (data) => data.chainId === chainId && data.result > BigInt(0)
    );

    result.map((data) => {
      const currentCometAddress = Object.values(MARKET_ADDRESSES[data.chainId])[data.index].address;
      claimCOMP(
        {
          abi: RewardsABI,
          address: rewardContactAddress,
          functionName: 'claim',
          args: [currentCometAddress, address, true],
        },
        {
          onSuccess: () => {
            setIsSuccessful(true);
          },
          onError: (error, variables, context) => {
            console.log('--context--', context);
            console.log('--variables--', variables);
            console.log('--error--', error);
          },
        }
      );
    });
  };

  const onClaimComp = (networkId: string) => {
    if (chainId !== Number(networkId)) {
      switchChainAsync({ chainId: Number(networkId) }).then(() => claim());
    } else {
      claim();
    }
  };

  useEffect(() => {
    document.addEventListener('click', onClickOutside);

    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (isSuccessful && !isAbsoluteLoadingClaimCOMP) {
      getData();
    }
  }, [isSuccessful, isAbsoluteLoadingClaimCOMP]);

  return (
    <>
      <View.Condition if={Boolean(isLessThan767 && isToggleOpen)}>
        <Grid
          gridTemplateColumns='1fr'
          gap='8px'
          p='20px 16px'
          bg='brand.1100'
          borderRadius='0 0 16px 16px'
        >
          {Object.keys(NetworksNames).map((key) => {
            const canClaim = getNetworkComp(Number(key));
            return (
              <Grid
                key={key}
                gridTemplateColumns='24px 1fr 1fr'
                gap='8px'
                alignItems='center'
              >
                <Image
                  width={24}
                  height={24}
                  loading='lazy'
                  src={`/markets/${NetworksNames[Number(key)].toLowerCase()}.svg`}
                  alt={NetworksNames[Number(key)]}
                />

                <Text
                  textAlign='left'
                  size='small14120500'
                >
                  {NetworksNames[Number(key)]}
                </Text>

                <Button
                  variant='lendMoreButtons'
                  bg='brand.750'
                  _hover={{
                    bg: 'brand.750',
                  }}
                  isDisabled={canClaim <= 0}
                  onClick={() => onClaimComp(key)}
                >
                  <Flex gap='5px'>
                    <Text
                      textAlign='left'
                      size='small12120500'
                    >
                      Claim {canClaim.toFixed(5)}
                    </Text>

                    <Image
                      style={{
                        flexShrink: 0,
                      }}
                      width={12}
                      height={12}
                      src='/logo.svg'
                      alt='comp'
                    />
                  </Flex>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </View.Condition>

      <View.Condition if={!isLessThan767}>
        <Button
          gridArea='2 / 2'
          justifySelf='flex-end'
          variant='lendMoreButtons'
          w='72px'
          onClick={!isOpen ? onOpen : onClose}
        >
          Claim
        </Button>

        <Flex
          gridArea='3 / span 2'
          ref={ref}
        >
          <Collapse in={isOpen}>
            <Grid
              gridTemplateColumns='1fr'
              gap='8px'
              pb='8px'
            >
              {Object.keys(NetworksNames).map((key) => {
                const canClaim = getNetworkComp(Number(key));

                return (
                  <Grid
                    key={key}
                    gridTemplateColumns='24px 1fr 1fr'
                    gap='8px'
                    alignItems='center'
                  >
                    <Image
                      width={24}
                      height={24}
                      loading='lazy'
                      src={`/markets/${NetworksNames[Number(key)].toLowerCase()}.svg`}
                      alt={NetworksNames[Number(key)]}
                    />

                    <Text
                      textAlign='left'
                      size='large12500140'
                    >
                      {NetworksNames[Number(key)]}
                    </Text>

                    <Button
                      variant='lendMoreButtons'
                      bg='brand.750'
                      p='10px 13px'
                      w='125px'
                      h='34px'
                      _hover={{
                        bg: 'brand.750',
                      }}
                      isDisabled={canClaim <= 0}
                      onClick={() => onClaimComp(key)}
                    >
                      <Flex gap='5px'>
                        <Text
                          textAlign='left'
                          size='small12120500'
                        >
                          Claim {canClaim.toFixed(5)}
                        </Text>

                        <Image
                          style={{
                            flexShrink: 0,
                          }}
                          width={12}
                          height={12}
                          src='/logo.svg'
                          alt='comp'
                        />
                      </Flex>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Collapse>
        </Flex>
      </View.Condition>
    </>
  );
};

export default ClaimComp;
