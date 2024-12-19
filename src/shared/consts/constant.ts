export const API_URL = process.env.NEXT_PUBLIC_API_IPFS_URL || '';

export const INFURA = process.env.NEXT_PUBLIC_INFURA_KEY || '';

export const ACTION_SUPPLY_TOKEN =
  '0x414354494f4e5f535550504c595f415353455400000000000000000000000000';

export const ACTION_SUPPLY_NATIVE_TOKEN =
  '0x414354494f4e5f535550504c595f4e41544956455f544f4b454e000000000000';

export const ACTION_WITHDRAW_NATIVE_TOKEN =
  '0x414354494f4e5f57495448445241575f4e41544956455f544f4b454e00000000';

export const ACTION_WITHDRAW_ASSET =
  '0x414354494f4e5f57495448445241575f41535345540000000000000000000000';

export type DirectionType = 'ascending' | 'descending';

export const secondsPerYear = 60 * 60 * 24 * 365;

export const oneDay = 24 * 60 * 60 * 1000;