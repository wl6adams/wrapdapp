import { DeepPartial, extendTheme, theme, ThemeOverride } from '@chakra-ui/react';

import { colors } from './colors';
import * as components from './overrides';

const themeConfig: DeepPartial<ThemeOverride> = {
  colors,
  styles: {
    global: () => ({
      html: { height: '100%' },
      body: {
        height: '100%',
        backgroundColor: '#0E0C15',
        color: '#fff',
      },
    }),
  },
  breakpoints: {
    base: '0em', // 0px
    sm: '30em', // ~480px.
    md: '48em', // ~768px
    lg: '62em', // ~992px
    laptop: '78em', // ~1248
    lgg: '667m',
    xl: '80em', // ~1280px
    '2xl': '96em', // ~1536px
  },
  fonts: {
    body: 'Red Hat Display, sans-serif',
  },
  components: { ...theme.components, ...components },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
};

export const mainTheme = extendTheme(themeConfig);
