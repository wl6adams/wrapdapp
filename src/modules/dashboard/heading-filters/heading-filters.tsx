import React, { useMemo } from 'react';
import { useMediaQuery } from '@chakra-ui/media-query';
import { Grid, Skeleton, Tab, TabIndicator, TabList, Tabs, Text } from '@chakra-ui/react';

import { Each } from '@/shared/ui/each';
import { SelectRadio } from '@/shared/ui/select';
import { CustomOptionsType } from '@/shared/ui/select/model/types';
import { View } from '@/shared/ui/view';
import { useDashboardStore } from '@/store/dashboard';

interface HeadingFiltersProps {
  title?: string;

  disabled?: boolean;

  isLoaded?: boolean;

  type?: HeadingFilterDateType;
}

const HeadingFilters = ({ title, disabled, type, isLoaded }: HeadingFiltersProps) => {
  return (
    <Grid
      pb='1rem'
      alignItems='center'
      gridTemplateColumns='repeat(2, 1fr)'
    >
      <Skeleton
        maxW='15rem'
        minH='2.5rem'
        display='flex'
        alignItems='center'
        borderRadius='50px'
        startColor='brand.150'
        isLoaded={isLoaded}
      >
        <Text>{title}</Text>
      </Skeleton>

      <Skeleton
        ml='auto'
        maxW='15rem'
        minH='2.5rem'
        borderRadius='50px'
        startColor='brand.150'
        isLoaded={isLoaded}
      >
        <HeadingFilterDate
          type={type}
          disabled={disabled}
        />
      </Skeleton>
    </Grid>
  );
};

enum HeadingFilterDateType {
  SELECT = 'SELECT',
  TABS = 'TABS',
}

const HeadingFilterDate = ({
  disabled,
  type = HeadingFilterDateType.TABS,
}: {
  disabled?: boolean;
  type?: HeadingFilterDateType;
}) => {
  const { filter, setFilter } = useDashboardStore();

  const [isLessThan768] = useMediaQuery('(max-width: 768px)');

  const typeFilter = useMemo(() => {
    if (isLessThan768) {
      return type || HeadingFilterDateType.SELECT;
    }

    return type || HeadingFilterDateType.TABS;
  }, [type, isLessThan768]);

  const activeFilter = filter.findIndex(({ active }) => active);

  const selector = useMemo(() => {
    const options = filter.map((el) => ({
      value: el.value.toString(),
      name: el.name,
      isActive: el.active,
    }));

    const activeOption = options.find((el) => el.isActive);

    return {
      options,
      activeOption,
    };
  }, [filter]);

  const onChangeFilter = (option: CustomOptionsType) => {
    const setActiveFilter = filter.map((el) =>
      option.value === el.value.toString() ? { ...el, active: true } : { ...el, active: false }
    );

    setFilter(setActiveFilter);
  };

  const onTabChangeFilter = (number: number) => {
    const setActiveFilter = filter.map((el, index) =>
      number === index ? { ...el, active: true } : { ...el, active: false }
    );

    setFilter(setActiveFilter);
  };

  return (
    <Grid
      opacity={disabled ? 0.5 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
      gridTemplateColumns='max-content'
      gap='8px'
      justifyContent='flex-end'
      alignItems='center'
    >
      <View.Condition if={typeFilter === HeadingFilterDateType.SELECT}>
        <SelectRadio defaultSelected={selector.activeOption!}>
          <SelectRadio.Icon
            outline='1px solid'
            outlineColor='brand.600'
            borderRadius='100px'
            h='40px'
            p='12px 14px'
          />

          <SelectRadio.List
            top='44px'
            left='-40px'
            w='107px'
            p='0'
          >
            <Each
              data={selector.options}
              render={(option) => (
                <SelectRadio.ListItem
                  gap='12px'
                  p='11px 11px 11px 16px'
                  fontSize='14px'
                  option={option}
                  onClick={() => onChangeFilter(option)}
                >
                  {option.name}
                </SelectRadio.ListItem>
              )}
            />
          </SelectRadio.List>
        </SelectRadio>
      </View.Condition>

      <View.Condition if={typeFilter === HeadingFilterDateType.TABS}>
        <Tabs
          // defaultIndex={0}
          index={activeFilter}
          position='relative'
          variant='unstyled'
          maxW='max-content'
          onChange={onTabChangeFilter}
        >
          <TabList
            bg='none'
            padding='8px 10px'
            position='relative'
            gap='8px'
          >
            {filter.map(({ name }, index) => (
              <Tab
                bg='brand.400'
                color='brand.50'
                key={`tabs_${index}`}
                zIndex={3}
                letterSpacing='2%'
                p='8px 16px'
                w='73px'
                h='40px'
                borderRadius='1000px'
              >
                <Text
                  size='small16500140'
                  letterSpacing='0.02em'
                >
                  {name}
                </Text>
              </Tab>
            ))}
          </TabList>

          <TabIndicator
            zIndex={4}
            top='8px'
            bottom='8px'
            height='auto'
            bg='none'
            border='1px solid'
            borderColor='brand.100'
            p='8px 16px'
            w='73px'
            h='40px'
            borderRadius='1000px'
          />
        </Tabs>
      </View.Condition>
    </Grid>
  );
};

export { HeadingFilterDate, HeadingFilterDateType, HeadingFilters };
