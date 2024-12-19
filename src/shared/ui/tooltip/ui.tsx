import React, { FC } from 'react';
import { Button, Tooltip } from '@chakra-ui/react';

import { ToolTipIcon } from '@/shared/chakra-ui/icons';

interface TooltipTextProps {
  description: string;

  iconStyle?: {
    [key: string]: any;
  };
}

const TooltipText: FC<TooltipTextProps> = ({ description, iconStyle }) => (
  <Tooltip
    label={description}
    placement='top'
  >
    <Button
      p='0'
      variant='unstile'
    >
      <ToolTipIcon
        width='14px'
        height='14px'
        {...iconStyle}
      />
    </Button>
  </Tooltip>
);

export { TooltipText };
