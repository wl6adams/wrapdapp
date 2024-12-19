import { FC, memo } from 'react';
import { Box } from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';

interface PageProps extends HTMLChakraProps<'div'> {}

export const PAGE_ID = 'PAGE_ID';

const Page: FC<PageProps> = memo(({ children, ...props }: PageProps) => {
  return (
    <Box
      id={PAGE_ID}
      as='main'
      m='0 auto'
      p='0 1rem'
      minW={{ md: 900, lg: 1200 }}
      maxW={{ md: 900, lg: 1200 }}
      {...props}
    >
      {children}
    </Box>
  );
});

export { Page };
