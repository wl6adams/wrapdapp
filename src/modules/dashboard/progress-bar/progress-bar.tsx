import { Box, Flex, Text } from '@chakra-ui/react';

const ProgressBar = () => {
  const percent = 78;

  const progressValue = 100 - percent;

  const getColorFromGradient = (value: number) => {
    if (value <= 50) {
      const green = 255;
      const red = Math.round((value / 50) * 255);
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const red = 255;
      const green = Math.round((1 - (value - 50) / 50) * 255);
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const progressColor = getColorFromGradient(100 - progressValue);
  return (
    <Flex
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      p='4px'
    >
      <Text
        color={progressColor}
        fontSize='2xl'
        mb={2}
      >
        {100 - progressValue}%
      </Text>

      <Box
        position='relative'
        width='100%'
        height='24px'
        borderRadius='4px'
        overflow='hidden'
      >
        <Box
          position='absolute'
          top='0'
          left='0'
          height='20px'
          width='100%'
          bg='brand.linearGradient.125'
          borderRadius='6px'
        />

        <Box
          position='absolute'
          top='0'
          right='0'
          height='20px'
          width={`${progressValue}%`}
          borderRightRadius='4px'
          bg='brand.400'
        />
      </Box>

      <Box
        display='flex'
        justifyContent='space-between'
        width='100%'
      >
        <Text
          color='brand.300'
          fontSize='large12500140'
        >
          0%
        </Text>
        <Text
          color='brand.300'
          fontSize='large12500140'
        >
          25%
        </Text>
        <Text
          color='brand.300'
          fontSize='large12500140'
        >
          50%
        </Text>
        <Text
          color='brand.300'
          fontSize='large12500140'
        >
          75%
        </Text>
        <Text
          color='brand.300'
          fontSize='large12500140'
        >
          100%
        </Text>
      </Box>
    </Flex>
  );
};

export default ProgressBar;
