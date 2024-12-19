import { formatUnits } from 'viem';

import { formatNumber, getTokenPrice } from '@/shared/lib/utils';
import { TableData } from '@/shared/web3/types';

const marketSortTotalSupply = (selectedMarketData?: TableData) => {
  return {
    ...selectedMarketData,
    configuratorData: selectedMarketData?.configuratorData
      .map((el) => {
        const tokenInUSD = getTokenPrice(
          selectedMarketData.asset,
          el.price,
          selectedMarketData.price
        );

        return {
          ...el,
          totalSupply: el.totalSupplyToken * tokenInUSD,
          maxTotalSupply: formatNumber(Number(formatUnits(el.supplyCap, el.decimals)) * tokenInUSD),
          reverse: formatNumber(Number(formatUnits(el.reserves, el.decimals)) * tokenInUSD),
          oraclePrice: formatNumber(tokenInUSD),
        };
      })
      .sort((a, b) => Number(b.totalSupply - a.totalSupply)),
  };
};

export { marketSortTotalSupply };
