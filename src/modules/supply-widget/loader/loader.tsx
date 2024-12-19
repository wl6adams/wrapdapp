import React from 'react';
import { Box } from '@chakra-ui/react';

const Loader = () => {
  return (
    <Box
      position='relative'
      m='100px auto'
    >
      <ul className='loader'>
        <li className='center'></li>
        <li className='item item-1'></li>
        <li className='item item-2'></li>
        <li className='item item-3'></li>
        <li className='item item-4'></li>
        <li className='item item-5'></li>
        <li className='item item-6'></li>
        <li className='item item-7'></li>
        <li className='item item-8'></li>
      </ul>
    </Box>
  );
};

export default Loader;
