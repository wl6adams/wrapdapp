import type { ReactNode } from 'react';
// eslint-disable-next-line no-duplicate-imports
import { Children } from 'react';

type EachProps<T> = {
  render: (item: T, index: number, itemArr: T[]) => ReactNode;

  data: T[];
};

const Each = <T,>({ render, data }: EachProps<T>) => (
  <>{Children.toArray(data.map((item, index, itemArr) => render(item, index, itemArr)))}</>
);

export { Each };
