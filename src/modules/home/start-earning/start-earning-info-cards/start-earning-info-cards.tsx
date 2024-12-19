import React, { memo, ReactNode } from 'react';
import Image from 'next/image';
import { Box, Collapse, Flex, Link as LinkRedirect, Text, useMediaQuery } from '@chakra-ui/react';

import { useToggle } from '@/shared/hooks/useToggle';

const InfoCard = memo(
  ({ title, description, icon }: { title: string; description: ReactNode; icon: ReactNode }) => {
    const [isDesktop] = useMediaQuery('(min-width: 800px)');

    const [isShow, onToggle] = useToggle(false);

    const onShowInfo = () => {
      if (!isDesktop) {
        onToggle();
      }
    };

    const onHover = () => {
      if (isDesktop) {
        onToggle();
      }
    };

    return (
      <Flex
        p='30px'
        bg='brand.750'
        h='max-content'
        border='1px solid'
        borderRadius='1.5rem'
        flexDirection='column'
        borderColor='brand.400'
        w={{ base: '100%', lg: '280px' }}
        minH={{ base: 'max-content', lg: isShow ? '351px' : 'max-content' }}
        onMouseEnter={onHover}
        onMouseLeave={onHover}
      >
        <Flex
          alignItems='flex-start'
          justifyContent='space-between'
        >
          {icon}

          <Image
            width={24}
            height={24}
            src={isShow ? '/info-card-description-open.svg' : '/info-card-description.svg'}
            alt='info-card'
            onClick={onShowInfo}
          />
        </Flex>

        <Text
          mt='1.5rem'
          size='large20700160'
        >
          {title}
        </Text>

        <Collapse in={isShow}>
          <Box
            mt='1rem'
            maxH={isShow ? '100%' : 0}
            // opacity={isShow ? 1 : 0}
            // visibility={isShow ? 'visible' : 'hidden'}
            // transition={
            //   isShow
            //     ? 'all 150ms ease-in-out'
            //     : 'max-height 150ms ease-in-out, opacity 150ms ease-in-out'
            // }
            // willChange="opacity, max-height"
          >
            {description}
          </Box>
        </Collapse>
      </Flex>
    );
  }
);

const StartEarningInfoCards = () => {
  return (
    <Flex
      zIndex={1}
      gap='20px'
      flexWrap='wrap'
      justifyContent='center'
      m={{ base: '1rem 1rem 0', lg: '50px 0 0' }}
      minH={{ base: 'auto', lg: '351px' }}
      flexDirection={{ base: 'column', sm: 'row' }}
      alignItems={{ base: 'center', lg: 'initial' }}
    >
      <InfoCard
        title='Original'
        description={
          <Text
            size='small14500140'
            color='brand.550'
          >
            As one of the first DeFi protocols in crypto, Compound sparked and continues to drive
            broader DeFi adoption, providing open financial services to millions across web3
          </Text>
        }
        icon={
          <Image
            width={40}
            height={40}
            src='/compound-info-card.svg'
            alt='compound-info-card'
          />
        }
      />

      <InfoCard
        title='Capital-efficient'
        description={
          <Text
            size='small14500140'
            color='brand.550'
          >
            Stending out as the most capital-efficient lending protocol in web3, Compound is able to
            provide better lending and borrowing rates to its users
          </Text>
        }
        icon={
          <Image
            width={40}
            height={40}
            src='/info-speed.svg'
            alt='info-speed'
          />
        }
      />

      <InfoCard
        title='Secure'
        description={
          <Text
            size='small14500140'
            color='brand.550'
          >
            Audited by the best security firms in the space (including security audits from{' '}
            <LinkRedirect
              textDecoration='underline'
              href='https://docs.compound.finance/v2/security/#audits'
            >
              OpenZeppelin
            </LinkRedirect>{' '}
            and{' '}
            <LinkRedirect
              textDecoration='underline'
              href='https://docs.compound.finance/v2/security/#audits'
            >
              Trail of Bits
            </LinkRedirect>
            , formal verification from{' '}
            <LinkRedirect
              textDecoration='underline'
              href='https://docs.compound.finance/v2/security/#formal-verification'
            >
              Certora
            </LinkRedirect>
            , and risk management assessment by{' '}
            <LinkRedirect
              textDecoration='underline'
              href='https://docs.compound.finance/v2/security/#economic-security'
            >
              Gauntlet
            </LinkRedirect>
            ), Compound is one of the safest DeFi platforms available.
          </Text>
        }
        icon={
          <Image
            width={40}
            height={40}
            src='/info-guard.svg'
            alt='info-guard'
          />
        }
      />

      <InfoCard
        title='Controlled by users'
        description={
          <Text
            size='small14500140'
            color='brand.550'
          >
            Ensuring that decisions are not controlled by any central authority, the Compound is
            entirely managed by a decentralized community of COMP token holders, who propose and
            vote on upgrades to the protocol.
          </Text>
        }
        icon={
          <Image
            width={40}
            height={40}
            src='/info-user-octagon.svg'
            alt='info-user-octagon'
          />
        }
      />
    </Flex>
  );
};

export { StartEarningInfoCards };
