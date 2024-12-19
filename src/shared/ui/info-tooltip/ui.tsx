import React, { createRef, RefObject, useEffect } from 'react';
import Image from 'next/image';
import { Flex, PlacementWithLogical, Show, Tooltip, useTooltip } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

import { useClickOutside } from '@/shared/hooks/useClickOutside';

interface InfoToolTipProps extends HTMLChakraProps<'div'> {
  label: string;

  placement?: PlacementWithLogical;
}

const InfoToolTip = ({ label, placement = 'bottom', ...props }: InfoToolTipProps) => {
  const ref: RefObject<HTMLDivElement> = createRef();

  const { isOpen, hide, show } = useTooltip();

  const onOpen = () => show();

  const onClose = () => hide();

  const onClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (isOpen) {
      onClose();

      return;
    }

    onOpen();
  };

  useClickOutside(ref, onClose);

  useEffect(() => {
    const onScroll = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <Show breakpoint='(max-width: 800px)'>
        <Flex
          alignItems='center'
          ref={ref}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onClick={onClick}
        >
          <Tooltip
            label={label}
            isOpen={isOpen}
            placement={placement}
            hasArrow
            maxW='146px'
            p='13px 12px'
            textAlign='center'
            fontSize='12px'
            lineHeight='12px'
            bg='brand.1100'
            color='brand.1250'
            {...props}
          >
            <Image
              width={14}
              height={14}
              src='/info-circle.svg'
              alt='info-circle'
            />
          </Tooltip>
        </Flex>
      </Show>

      <Show breakpoint='(min-width: 801px)'>
        <Tooltip
          label={label}
          maxW='146px'
          hasArrow
          p='13px 12px'
          textAlign='center'
          fontSize='12px'
          lineHeight='12px'
          bg='brand.1100'
          color='brand.1250'
          placement={placement}
          {...props}
        >
          <Image
            width={14}
            height={14}
            src='/info-circle.svg'
            alt='info-circle'
          />
        </Tooltip>
      </Show>
    </>
  );
};

export { InfoToolTip };
