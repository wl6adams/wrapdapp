'use client';

import { PropsWithChildren } from 'react';
import { Box } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

import { useToggle } from '@/shared/hooks/useToggle';

interface MarqueeProps extends PropsWithChildren, HTMLChakraProps<'div'> {
  time?: string;
}

const Marquee = ({ children, time = '30s', ...props }: MarqueeProps) => {
  const [isPaused, onToggle] = useToggle(false);

  return (
    <Box
      {...props}
      whiteSpace='nowrap'
      overflow='hidden'
      width='100%'
      position='relative'
      onMouseEnter={onToggle}
      onMouseLeave={onToggle}
    >
      <Box
        display='flex'
        gap='14px'
        animation={`marquee ${time} linear infinite`}
        _hover={{
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {children}

        {children}
      </Box>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Box>
  );
};

export { Marquee };
