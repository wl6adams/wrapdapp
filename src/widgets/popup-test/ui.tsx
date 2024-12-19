'use client';

import React, { useEffect, useState } from 'react';
import { Button, Flex, Grid, Text } from '@chakra-ui/react';

import { ModalsLayout } from '../modal';

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');

    if (!hasSeenPopup) {
      setIsOpen(true);

      sessionStorage.setItem('hasSeenPopup', 'true');
    }
  }, []);

  return (
    <ModalsLayout
      bgWhite='brand.150'
      bgBlack='brand.750'
      isHiddenClose
      isOpen={isOpen}
      onClose={() => {}}
    >
      <Grid gridTemplateColumns='1fr'>
        <Text
          fontWeight='700'
          size='small16500140'
          textAlign='center'
          borderBottom='1px solid'
          borderColor='brand.400'
          p='12px'
        >
          NOTICE: CLOSED BETA – USE AT YOUR OWN RISK
        </Text>

        <Flex
          gap='1rem'
          p='1.125rem'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          minHeight='150px'
        >
          <Text
            size='small14400'
            lineHeight='140%'
            fontWeight='600'
          >
            This website is currently in a closed beta phase. By using this interface:
          </Text>

          <Text
            size='small14400'
            lineHeight='140%'
          >
            1. You acknowledge that this product is a work in progress and may contain unresolved
            bugs, vulnerabilities, or performance issues.
          </Text>

          <Text
            size='small14400'
            lineHeight='140%'
          >
            2. You accept that interactions with on-chain funds carry inherent risks, including but
            not limited to partial or total loss of funds.
          </Text>

          <Text
            size='small14400'
            lineHeight='140%'
          >
            3. You agree to participate responsibly and report any issues or vulnerabilities via the
            designated feedback form or email.
          </Text>
          <Text
            size='small14400'
            lineHeight='140%'
          >
            Important: Do not use this beta interface for significant transactions. By using this
            beta website you acknowledge that Compound DAO and its contributors, or any affiliated
            entity, bear no responsibility for any losses incurred.
          </Text>
        </Flex>

        <Flex justifyContent='center'>
          <Button
            w='90%'
            m='0 0 15px'
            onClick={() => setIsOpen(false)}
            variant='actionButtons'
          >
            Agree and Proceed
          </Button>
        </Flex>
      </Grid>
    </ModalsLayout>
  );
};

export { Popup };
