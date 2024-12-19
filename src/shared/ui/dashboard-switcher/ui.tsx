'use client';

import { Tab, TabIndicator, TabList, Tabs, Text } from '@chakra-ui/react';

import { useDashboardStore } from '@/store/dashboard';

const TABS = ['Lending', 'Borrowing', 'Transactions'];

const DashboardSwitcher = () => {
  const { viewPage, setViewPage } = useDashboardStore();

  return (
    <Tabs
      position='relative'
      variant='unstyled'
      m='0 auto'
      maxW='max-content'
      index={viewPage}
      onChange={setViewPage}
    >
      <TabList
        border='1px solid'
        borderColor='brand.400'
        bg='brand.750'
        padding='8px 10px'
        borderRadius={40}
        position='relative'
      >
        {TABS.map((tab, index) => (
          <Tab
            color='brand.50'
            key={`tabs_${index}`}
            zIndex={3}
            letterSpacing='2%'
            _selected={{ color: 'brand.150' }}
          >
            <Text
              size='small16500140'
              letterSpacing='0.02em'
            >
              {tab}
            </Text>
          </Tab>
        ))}
      </TabList>

      <TabIndicator
        zIndex={2}
        borderRadius={40}
        top='8px'
        bottom='8px'
        height='auto'
        bg='brand.100'
      />
    </Tabs>
  );
};

export { DashboardSwitcher };
