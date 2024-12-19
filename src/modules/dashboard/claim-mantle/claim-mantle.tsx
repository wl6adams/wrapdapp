import { createRef, useEffect, useState } from 'react';
import { View } from 'src/shared/ui/view';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { useClaimCOMP } from '@/shared/web3/hook';
import { CompTotalData } from '@/shared/web3/types';

const ClaimMantle = ({
  getData,
}: {
  allCompData: CompTotalData[] | undefined;
  isToggleOpen?: boolean;
  getData: () => void;
}) => {
  const ref: React.RefObject<HTMLDivElement> = createRef();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // const { chainId, address } = useAccount();

  // const { switchChainAsync } = useSwitchChain();

  const [isSuccessful] = useState(false);

  const [isLessThan767] = useMediaQuery('(max-width: 767px)');

  const { isAbsoluteLoadingClaimCOMP } = useClaimCOMP();

  const onClickOutside = (event: MouseEvent) => {
    if (ref) {
      const cur = ref.current;
      if (cur && !cur.contains(event.target as Node)) {
        onClose();
      }
    }
  };

  // const getNetworkComp = useCallback(
  //   (networkId: number): number => {
  //     if (!allCompData) {
  //       return 0;
  //     }
  //
  //     const result = allCompData
  //
  //       .filter(({ chainId }) => chainId === networkId)
  //       .map(({ result }) => result)
  //       .reduce((a, b) => a + b);
  //
  //     return Number(formatUnits(result, 18));
  //   },
  //   [allCompData]
  // );

  // const claim = () => {
  //   if (!chainId || !address || !allCompData) {
  //     return;
  //   }
  //
  //   const rewardContactAddress = REWARDS_ADDRESSES[chainId];
  //
  //   const result = allCompData.filter(
  //     (data) => data.chainId === chainId && data.result > BigInt(0)
  //   );
  //
  //   result.map((data) => {
  //     const currentCometAddress = Object.values(MARKET_ADDRESSES[data.chainId])[data.index].address;
  //     claimCOMP(
  //       {
  //         abi: RewardsABI,
  //         address: rewardContactAddress,
  //         functionName: 'claim',
  //         args: [currentCometAddress, address, true],
  //       },
  //       {
  //         onSuccess: () => {
  //           setIsSuccessful(true);
  //         },
  //       }
  //     );
  //   });
  // };

  // const onClaimComp = (networkId: string) => {
  //   if (chainId !== Number(networkId)) {
  //     switchChainAsync({ chainId: Number(networkId) }).then(() => claim());
  //   } else {
  //     claim();
  //   }
  // };

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
      {/*<View.Condition if={Boolean(isLessThan767 && isToggleOpen)}>*/}
      {/*  <Grid*/}
      {/*    gridTemplateColumns="1fr"*/}
      {/*    gap="8px"*/}
      {/*    p="20px 16px"*/}
      {/*    bg="brand.1100"*/}
      {/*    borderRadius="0 0 16px 16px"*/}
      {/*  >*/}
      {/*    {Object.keys(NetworksNames)*/}
      {/*      .slice(0, -1)*/}
      {/*      .map((key) => {*/}
      {/*        const canClaim = getNetworkComp(Number(key));*/}
      {/*        return (*/}
      {/*          <Grid key={key} gridTemplateColumns="24px 1fr 1fr" gap="8px" alignItems="center">*/}
      {/*            <Image*/}
      {/*              width={24}*/}
      {/*              height={24}*/}
      {/*              loading="lazy"*/}
      {/*              src={`/markets/${NetworksNames[Number(key)].toLowerCase()}_active.svg`}*/}
      {/*              alt={NetworksNames[Number(key)]}*/}
      {/*            />*/}

      {/*            <Text textAlign="left" size="small14120500">*/}
      {/*              {NetworksShortNames[Number(key)]}*/}
      {/*            </Text>*/}

      {/*            <Button*/}
      {/*              variant="lendMoreButtons"*/}
      {/*              bg="brand.750"*/}
      {/*              _hover={{*/}
      {/*                bg: 'brand.750',*/}
      {/*              }}*/}
      {/*              isDisabled={canClaim <= 0}*/}
      {/*              onClick={() => onClaimComp(key)}*/}
      {/*            >*/}
      {/*              <Text textAlign="left" size="small14120500">*/}
      {/*                Claim {canClaim.toFixed(3)}*/}
      {/*              </Text>*/}
      {/*            </Button>*/}
      {/*          </Grid>*/}
      {/*        );*/}
      {/*      })}*/}
      {/*  </Grid>*/}
      {/*</View.Condition>*/}

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
          {/*<Collapse in={isOpen}>*/}
          {/*  <Grid gridTemplateColumns="1fr" gap="8px" pb="8px">*/}
          {/*    <Grid gridTemplateColumns="24px 1fr 1fr" gap="8px" alignItems="center">*/}
          {/*      <Image*/}
          {/*        width={24}*/}
          {/*        height={24}*/}
          {/*        loading="lazy"*/}
          {/*        src={`/markets/sepolia_active.svg`}*/}
          {/*        alt="sepolia_active"*/}
          {/*      />*/}

          {/*      <Text textAlign="left" size="large12500140">*/}
          {/*        SEP*/}
          {/*      </Text>*/}

          {/*      <Button*/}
          {/*        variant="lendMoreButtons"*/}
          {/*        bg="brand.750"*/}
          {/*        p="10px 13px"*/}
          {/*        w="105px"*/}
          {/*        h="34px"*/}
          {/*        _hover={{*/}
          {/*          bg: 'brand.750',*/}
          {/*        }}*/}
          {/*        isDisabled*/}
          {/*      >*/}
          {/*        <Text textAlign="left" size="small14120500">*/}
          {/*          Claim 0.000*/}
          {/*        </Text>*/}
          {/*      </Button>*/}
          {/*    </Grid>*/}
          {/*  </Grid>*/}
          {/*</Collapse>*/}
        </Flex>
      </View.Condition>
    </>
  );
};

export default ClaimMantle;
