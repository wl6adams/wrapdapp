import { createRef, useEffect, useState } from 'react';
import { Collapse, Flex, Grid, Radio, RadioGroup, useDisclosure } from '@chakra-ui/react';

import { DirectionType } from '@/modules/market/table';
import { SortIconDown } from '@/shared/chakra-ui/icons';
import { TableData } from '@/shared/web3/types';

type CustomOptionsType = {
  value: string;
  name: string;
  isUtility?: boolean;
};

const CustomSelect = ({
  formName,
  customOptions,
  requestSort,
  onChangeUtility,
  onChangeMarket,
  reset,
  isSmall,
  ...styles
}: {
  formName: string;
  isSmall?: boolean;
  reset: boolean;
  customOptions: CustomOptionsType[];
  requestSort: (key: keyof TableData) => void;
  onChangeUtility: (key: DirectionType) => void;
  onChangeMarket?: (market: string) => void;
  [key: string]: any;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selected, setSelected] = useState<CustomOptionsType | null>(null);

  const ref: React.RefObject<HTMLDivElement> = createRef();

  const handleClickOutside = (event: MouseEvent) => {
    if (ref && ref !== null) {
      const cur = ref.current;
      if (cur && !cur.contains(event.target as Node)) {
        onClose();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (reset) {
      setSelected(null);
    }
  }, [reset]);

  useEffect(() => {
    if (onChangeMarket && selected) {
      onChangeMarket(selected.value);
      return;
    }
    if (selected) {
      if (selected?.isUtility) {
        onChangeUtility(selected.value as DirectionType);
      } else {
        requestSort(selected.value as keyof TableData);
      }
    }
  }, [selected]);

  return (
    <Flex
      position='relative'
      ref={ref}
      justifySelf={isSmall ? 'flex-start' : 'flex-end'}
      {...styles}
    >
      <Flex
        bg='brand.400'
        p='8px 8px 8px 16px'
        borderRadius='8px'
        cursor='pointer'
        alignItems='center'
        gap='8px'
        onClick={!isOpen ? onOpen : onClose}
        textTransform='capitalize'
      >
        {!selected ? formName : selected.name}{' '}
        <SortIconDown
          width='12px'
          height='10px'
          color='#fff'
          style={{ transform: `rotate(${isOpen ? 180 : 0}deg)`, transition: 'all .3s' }}
        />
      </Flex>

      <Flex
        position='absolute'
        top='60px'
        right={!isSmall ? '0' : undefined}
        left={isSmall ? '0' : undefined}
        zIndex={999}
      >
        <Collapse in={isOpen}>
          <Grid
            w={isSmall ? '180px' : '145px'}
            bg='brand.400'
            p='8px 16px'
            borderRadius='8px'
            border='1px solid'
            borderColor='brand.600'
          >
            <RadioGroup
              name={formName}
              defaultValue={customOptions[0].value}
              value={
                customOptions.find((data) => data.value === selected?.value)?.value ||
                customOptions[0].value
              }
              onChange={(value) => {
                const find = customOptions.find((data) => data.value === value);
                if (find) {
                  setSelected(find);
                  onClose();
                }
              }}
            >
              {customOptions.map((data) => (
                <Radio
                  key={data.value}
                  value={data.value}
                  _checked={{
                    bg: 'brand.400',
                    color: 'white',
                    border: '4px solid',
                    borderColor: 'brand.100',
                  }}
                  m='4px 0'
                >
                  {data.name}
                </Radio>
              ))}
            </RadioGroup>
          </Grid>
        </Collapse>
      </Flex>
    </Flex>
  );
};

export default CustomSelect;
