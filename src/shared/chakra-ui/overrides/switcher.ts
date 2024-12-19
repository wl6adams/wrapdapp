import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  switchAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    w: '36px',
    h: '20px',
  },
  thumb: {
    bg: 'brand.50',
    _checked: {
      bg: 'brand.50',
    },
  },
  track: {
    bg: 'brand.550',
    borderRadius: '12px',
    _checked: {
      bg: 'brand.800',
    },
  },
});

export const Switch = defineMultiStyleConfig({ baseStyle });
