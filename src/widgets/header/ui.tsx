'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  IconButton,
  Link as LinkRedirect,
  Show,
  Tab,
  TabIndicator,
  TabList,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';

import { RPCModal } from '@/modules/rpc/rpc-modal';
import WalletConnect from '@/modules/wallet-coonect/wallet-coonect';
import { CompoundLogo } from '@/shared/ui/compound-logo';
import { Each } from '@/shared/ui/each';
import { View } from '@/shared/ui/view';
import { WalletMenu } from '@/shared/ui/wallet-menu';
import { ModalsLayout } from '@/widgets/modal';

const MENU_ITEMS = [
  {
    name: 'Home',
    href: '',
  },
  {
    name: 'Lend',
    href: 'lend',
  },
  {
    name: 'Borrow',
    href: 'borrow',
  },
  {
    name: 'Dashboard',
    href: 'dashboard',
  },
];

function Header({ withOutTabs }: { withOutTabs?: boolean }) {
  const pathname = usePathname();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { isOpen: isRPCOpen, onOpen: onRPCOpen, onClose: onRPCClose } = useDisclosure();

  const [showMenu, setShowMenu] = useState(false);

  const { address } = useAccount();

  const defaultIndex = useMemo(
    () => MENU_ITEMS.findIndex((item) => item.href === pathname.split('/')[1]),
    [pathname]
  );

  return (
    <>
      <Box
        borderBottom={{ md: 'none', base: '1px solid #4B4A51' }}
        zIndex={5}
        position='sticky'
        top={0}
        bg='brand.150'
        padding='16px'
        as='header'
      >
        <Container
          alignItems='center'
          display='flex'
          justifyContent='space-between'
          maxW={1200}
        >
          <Show breakpoint='(min-width: 769px)'>
            <Flex
              w='100%'
              alignItems='center'
              justifyContent='space-between'
            >
              <Link
                href='/'
                _hover={{
                  textDecoration: 'none',
                }}
              >
                <CompoundLogo />
              </Link>

              <Tabs
                index={defaultIndex}
                display={withOutTabs ? 'none' : { base: 'none', md: 'block' }}
                position='relative'
                variant='unstyled'
              >
                <TabList
                  bg='brand.whiteAlpha.50'
                  padding='8px 10px'
                  borderRadius={40}
                  zIndex={1}
                  position='relative'
                >
                  <Each
                    data={MENU_ITEMS}
                    render={(menuItem) => (
                      <Link
                        href={`/${menuItem.href}`}
                        _hover={{
                          borderRadius: 40,
                          bg: 'brand.whiteAlpha.200',
                        }}
                      >
                        <Tab letterSpacing='2%'>{menuItem.name}</Tab>
                      </Link>
                    )}
                  />

                  <LinkRedirect
                    href='https://app.compound.finance/vote'
                    target='_blank'
                    _hover={{
                      borderRadius: 40,
                      bg: 'brand.whiteAlpha.200',
                    }}
                  >
                    <Tab letterSpacing='2%'>Vote</Tab>
                  </LinkRedirect>

                  <LinkRedirect
                    href='https://docs.google.com/forms/d/e/1FAIpQLSct9M4dQE6Tj7cn4xmKsDUSC4j1DMRtEp6S-T6r35mwiKNpZA/viewform?pli=1'
                    target='_blank'
                    _hover={{
                      borderRadius: 40,
                      bg: 'brand.whiteAlpha.200',
                    }}
                  >
                    <Tab
                      color='brand.100'
                      letterSpacing='2%'
                    >
                      Report Bug
                    </Tab>
                  </LinkRedirect>
                </TabList>

                <TabIndicator
                  display={defaultIndex === -1 ? 'none' : 'block'}
                  zIndex={0}
                  borderRadius={40}
                  top='8px'
                  bottom='8px'
                  height='auto'
                  bg='brand.whiteAlpha.200'
                />
              </Tabs>

              <View.Condition if={!showMenu}>
                <View.Condition if={Boolean(address)}>
                  <WalletMenu
                    connectWallet={onOpen}
                    onRPCOpen={onRPCOpen}
                  />
                </View.Condition>

                <View.Condition if={!address}>
                  <Button
                    w='140px'
                    h='43px'
                    color='brand.750'
                    onClick={onOpen}
                  >
                    Connect Wallet
                  </Button>
                </View.Condition>
              </View.Condition>
            </Flex>
          </Show>

          <Show breakpoint='(max-width: 768px)'>
            <Grid w='100%'>
              <Flex
                w='100%'
                h='40px'
                justifyContent='space-between'
              >
                <Flex
                  gap='8px'
                  alignItems='center'
                >
                  <IconButton
                    aria-label='Open Menu'
                    size='sm'
                    bg='brand.850'
                    borderRadius='8px'
                    mr={2}
                    _hover={{
                      bg: 'brand.850',
                    }}
                    icon={
                      !showMenu ? (
                        <HamburgerIcon
                          width='20px'
                          height='22px'
                        />
                      ) : (
                        <Image
                          width={24}
                          height={24}
                          src='/close.svg'
                          alt='close'
                        />
                      )
                    }
                    onClick={() => setShowMenu(!showMenu)}
                  />

                  <Image
                    width={108}
                    height={24}
                    src='/compound-logo.svg'
                    alt='compound-logo'
                  />
                </Flex>

                <View.Condition if={!showMenu}>
                  <View.Condition if={Boolean(address)}>
                    <WalletMenu
                      connectWallet={onOpen}
                      onRPCOpen={onRPCOpen}
                    />
                  </View.Condition>

                  <View.Condition if={!address}>
                    <Button
                      w='140px'
                      h='43px'
                      color='brand.750'
                      onClick={onOpen}
                    >
                      Connect Wallet
                    </Button>
                  </View.Condition>
                </View.Condition>
              </Flex>

              <Grid
                w='100%'
                position='fixed'
                zIndex={showMenu ? '999' : '1'}
                top='73px'
                left={showMenu ? '0' : '-100%'}
                transition='left .4s'
                height='calc(100vh - 70px)'
                bg='brand.150'
              >
                <Flex
                  w='100%'
                  textAlign='center'
                  alignItems='center'
                  justifyContent='center'
                  fontSize='24px'
                  gap='12px'
                  flexDirection='column'
                >
                  <Each
                    data={MENU_ITEMS}
                    render={(menuItem, index) => (
                      <Link
                        w='209px'
                        h='69px'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        textDecoration='none'
                        bg={index === defaultIndex ? 'brand.400' : 'none'}
                        borderRadius='77px'
                        _hover={{
                          textDecoration: 'none',
                        }}
                        href={`/${menuItem.href}`}
                        onClick={() => setShowMenu(false)}
                      >
                        {menuItem.name}
                      </Link>
                    )}
                  />

                  <LinkRedirect
                    href='https://app.compound.finance/vote'
                    target='_blank'
                    w='209px'
                    h='69px'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    textDecoration='none'
                    borderRadius='77px'
                    _hover={{
                      textDecoration: 'none',
                    }}
                  >
                    Vote
                  </LinkRedirect>

                  <LinkRedirect
                    href='https://docs.google.com/forms/d/e/1FAIpQLSct9M4dQE6Tj7cn4xmKsDUSC4j1DMRtEp6S-T6r35mwiKNpZA/viewform?pli=1'
                    target='_blank'
                    color='brand.100'
                    w='209px'
                    h='69px'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    textDecoration='none'
                    borderRadius='77px'
                    _hover={{
                      textDecoration: 'none',
                    }}
                  >
                    Report Bug
                  </LinkRedirect>
                </Flex>

                <Flex
                  h='24px'
                  justifyContent='center'
                  alignItems='center'
                  gap='24px'
                >
                  <Link
                    href='https://x.com/compoundfinance'
                    target='_blank'
                  >
                    <Image
                      width={24}
                      height={24}
                      src='/social/x-twitter.svg'
                      alt='x-twitter'
                    />
                  </Link>

                  <Link
                    href='https://discord.com/channels/402910780124561410/402910780670083094'
                    target='_blank'
                  >
                    <Image
                      width={24}
                      height={24}
                      src='/social/discord.svg'
                      alt='discord'
                    />
                  </Link>

                  <Link
                    href='https://x.com/growcompound'
                    target='_blank'
                  >
                    <Image
                      width={24}
                      height={24}
                      src='/social/x-twitter.svg'
                      alt='x-twitter'
                    />
                  </Link>
                </Flex>
              </Grid>
            </Grid>
          </Show>
        </Container>
      </Box>

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
          }}
        />
      </ModalsLayout>

      <ModalsLayout
        isHiddenClose
        isOpen={isRPCOpen}
        onClose={onRPCClose}
        bgWhite='brand.150'
        bgBlack='brand.750'
      >
        <RPCModal />
      </ModalsLayout>
    </>
  );
}

export default Header;
