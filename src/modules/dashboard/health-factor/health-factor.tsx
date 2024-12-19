import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

const HealthFactor = () => {
  const percent = 2.5;

  const progressValue = 10 - percent;

  const getColorFromGradient = (value: number) => {
    if (value <= 5) {
      const green = 255;
      const red = Math.round((value / 5) * 255);
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const red = 255;
      const green = Math.round((1 - (value - 5) / 5) * 255);
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const progressColor = getColorFromGradient(10 - progressValue);
  return (
    <Flex
      border='1px solid'
      borderColor={progressColor}
      w='60px'
      h='60px'
      alignItems='center'
      justifyContent='center'
      borderRadius='50%'
    >
      <Text
        color={progressColor}
        size='large28500150'
      >
        {10 - progressValue}
      </Text>
    </Flex>
  );
};

export default HealthFactor;
