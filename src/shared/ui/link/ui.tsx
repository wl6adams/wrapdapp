'use client';

import { forwardRef, ReactNode } from 'react';
import { Link as NextLink } from '@chakra-ui/next-js';
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react';

interface ILinkProps extends LinkProps {
  children: ReactNode;
  href: string;
  target?: string;
}

const Link = forwardRef<HTMLAnchorElement, ILinkProps>(
  ({ children, href, target, ...props }, ref) => {
    if (target) {
      return (
        <ChakraLink
          href={href}
          target={target}
          ref={ref}
          _hover={{
            textDecoration: 'none',
            color: 'brand.450',
          }}
          {...props}
        >
          {children}
        </ChakraLink>
      );
    }

    return (
      <NextLink
        href={href}
        ref={ref}
        _hover={{
          textDecoration: 'none',
          color: 'brand.450',
        }}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

export { Link };
