import { defineStyle, defineStyleConfig, SystemStyleObject } from '@chakra-ui/react';

const primary: SystemStyleObject = {
  bgColor: 'brand.100',
  _hover: {
    bgColor: 'brand.primaryAlpha.800',
  },
  _active: {
    bgColor: 'brand.primaryAlpha.900',
  },
  _disabled: {
    color: 'brand.300',
    borderColor: 'brand.300',
    bgColor: 'brand.150',
    cursor: 'not-allowed',
    opacity: 1,
  },
};

const medium = defineStyle({
  fontSize: '16px',
  letterSpacing: '2%',
  padding: '9px 20px',
  fontWeight: 500,
});

const secondary: SystemStyleObject = {
  color: 'brand.white',
  backdropFilter: 'blur(5px)',
  bgColor: 'brand.whiteAlpha.300',
  _hover: {
    bgColor: 'brand.whiteAlpha.400',
  },
  _active: {
    bgColor: 'brand.whiteAlpha.500',
  },
  _disabled: {
    color: 'brand.gray',
    borderColor: 'brand.whiteAlpha.200',
    bgColor: 'brand.whiteAlpha.200',
    cursor: 'not-allowed',
    opacity: 1,
  },
};

const unstyled: SystemStyleObject = {
  bacColor: 'none',
  border: 'none',
};

const collapseButtons: SystemStyleObject = {
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderRadius: '0',
  borderColor: 'rgba(255,255,255,0.08)',
  p: '16px 24px',
};

const circleButtons: SystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  borderColor: 'brand.1150',
  bg: 'brand.400',
  p: 0,
  _disabled: {
    opacity: '0.6',
  },
};

const walletButtons: SystemStyleObject = {
  p: '16px',
  borderRadius: '8px',
  border: '1px solid ',
  borderColor: 'brand.600',
  bg: 'brand.400',
  _hover: {
    bg: 'brand.550',
  },
  _active: {},
  _disabled: {},
};

const maxButtons: SystemStyleObject = {
  w: '64px',
  p: '9px 20px',
  borderRadius: '100px',
  border: 'none',
  backdropFilter: 'blur(5px)',
  bg: 'rgba(255,255,255,0.15)',
  fontSize: '12px',
  lineHeight: '140%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: '#fff',
  _hover: {
    bg: 'rgba(255,255,255,0.5)',
  },
  _active: {},
  _disabled: {},
};

const smallMaxButtons: SystemStyleObject = {
  w: 'max-content',
  h: '20px',
  p: '0',
  border: 'none',
  bg: 'none',
  fontSize: '12px',
  lineHeight: '157%',
  fontWeight: 500,
  color: 'brand.1000',
  _hover: {
    opacity: 0.7,
  },
  _active: {},
  _disabled: {},
};

const filterButtons: SystemStyleObject = {
  w: 'max-content',
  p: '8px 16px',
  display: 'flex',
  columnGap: '8px',
  borderRadius: '8px',
  border: 'none',
  bg: 'brand.500',
  fontSize: '14px',
  lineHeight: '120%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: '#fff',
  _hover: {
    opacity: '0.7',
  },
  _active: {},
  _disabled: {},
};

const tableButtons: SystemStyleObject = {
  w: '105px',
  p: '10px 24px',
  borderRadius: '50px',
  border: 'none',
  bg: 'brand.600',
  fontSize: '12px',
  lineHeight: '120%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: '#fff',
  _hover: {
    opacity: '0.7',
  },
  _active: {},
  _disabled: {},
};
const tableButtonsRed: SystemStyleObject = {
  p: '10px 24px',
  borderRadius: '50px',
  border: 'none',
  bg: 'brand.600',
  fontSize: '12px',
  lineHeight: '120%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: 'brand.1050',
  _hover: {
    opacity: '0.7',
  },
  _active: {},
  _disabled: {},
};

const actionButtons: SystemStyleObject = {
  w: '100%',
  p: '8px 20px',
  borderRadius: '100px',
  border: 'none',
  backdropFilter: 'blur(5px)',
  bg: '#00D395',
  fontSize: '16px',
  lineHeight: '160%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: '#0E0C15',
  _hover: {
    bg: '#00D395',
    opacity: 0.8,
    _disabled: {
      bg: '#00D395',
      opacity: 0.2,
    },
  },
  _active: {},
  _disabled: {
    opacity: 0.2,
  },
};

const withDrawButtons: SystemStyleObject = {
  w: '100%',
  p: '10px 24px',
  borderRadius: '50px',
  border: '1px solid',
  backdropFilter: 'blur(5px)',
  borderColor: 'brand.1150',
  bg: 'transparent',
  fontSize: '12px',
  lineHeight: '120%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: 'brand.50',
  _hover: {
    bg: 'transparent',
    opacity: 0.8,
    _disabled: {
      bg: 'transparent',
      opacity: 0.2,
    },
  },
  _active: {},
  _disabled: {
    opacity: 0.2,
  },
};

const lendMoreButtons: SystemStyleObject = {
  w: '100%',
  p: '10px 24px',
  borderRadius: '50px',
  border: 'none',
  backdropFilter: 'blur(5px)',
  bg: 'brand.600',
  fontSize: '12px',
  lineHeight: '120%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: 'brand.50',
  _hover: {
    bg: 'brand.600',
    opacity: 0.8,
    _disabled: {
      bg: 'brand.600',
      opacity: 0.2,
    },
  },
  _active: {},
  _disabled: {
    opacity: 0.2,
  },
};

const rpcButton: SystemStyleObject = {
  w: 'max-content',
  maxH: '34px',
  p: '5px 5px',
  borderRadius: '9px',
  border: '1px solid',
  borderColor: 'brand.1750',
  bg: 'brand.1725',
  fontSize: '16px',
  lineHeight: '140%',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: 'brand.1800',
  _hover: {
    bg: 'brand.1725',
    opacity: 0.8,
    _disabled: {
      bg: 'brand.1725',
      opacity: 0.2,
    },
  },
  _active: {},
  _disabled: {
    opacity: 0.2,
  },
};

export const Button = defineStyleConfig({
  baseStyle: {
    color: 'brand.black',
    fontWeight: 400,
    lineHeight: 'normal',
    borderRadius: '100px',
    border: '1px solid',
    borderColor: 'transparent',
    fontSize: '14px',
    fontFamily: 'var(--font-proximaNova)',
  },
  sizes: {
    medium,
  },
  variants: {
    primary,
    tableButtons,
    secondary,
    filterButtons,
    unstyled,
    collapseButtons,
    maxButtons,
    smallMaxButtons,
    walletButtons,
    actionButtons,
    withDrawButtons,
    lendMoreButtons,
    tableButtonsRed,
    circleButtons,
    rpcButton,
  },
  defaultProps: {
    variant: 'primary',
    size: 'medium',
  },
});
