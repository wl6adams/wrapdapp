import { ComponentStyleConfig, defineStyle } from '@chakra-ui/react';

const small16400 = defineStyle({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '100%',
});

const small = defineStyle({
  fontSize: '18px',
  fontWeight: 800,
  lineHeight: '100%',
});

const small40017 = defineStyle({
  fontSize: '17.14px',
  lineHeight: '19.03px',
  fontWeight: 400,
});

const small20 = defineStyle({
  fontSize: '20px',
  fontWeight: 400,
  lineHeight: '22px',
});
const small14 = defineStyle({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '15.54px',
});

const small22 = defineStyle({
  fontSize: '22px',
  fontWeight: 400,
  lineHeight: '26.62px',
});

const medium4001645 = defineStyle({
  fontSize: '16.45px',
  lineHeight: '18.26px',
  fontWeight: 400,
});

const small40024 = defineStyle({
  fontSize: '24px',
  fontWeight: 400,
  lineHeight: '26.64px',
});

const medium = defineStyle({
  fontSize: '32px',
  fontWeight: 400,
  lineHeight: '35px',
});

const medium42 = defineStyle({
  fontSize: '42px',
  fontWeight: 400,
  lineHeight: '111%',
});

const large = defineStyle({
  fontSize: '55px',
  fontWeight: 400,
  lineHeight: '61.05px',
});

const large28400 = defineStyle({
  fontSize: '28px',
  lineHeight: '31.08px',
  fontWeight: 400,
});
const large55400 = defineStyle({
  fontSize: '55px',
  lineHeight: '61.05px',
  fontWeight: 400,
});
const huge125400 = defineStyle({
  fontSize: '125px',
  lineHeight: '151.25px',
  fontWeight: 400,
});

export const Heading: ComponentStyleConfig = {
  sizes: {
    small16400,
    small,
    small14,
    small20,
    small22,
    small40017,
    medium,
    medium42,
    medium4001645,
    large,
    large28400,
    large55400,
    small40024,
    huge125400,
  },
  defaultProps: {
    size: 'medium',
  },
  baseStyle: {
    fontFamily: 'var(--font-monument)',
  },
};
