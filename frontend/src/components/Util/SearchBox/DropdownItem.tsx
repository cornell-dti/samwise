import React, { ReactElement } from 'react';
import { FuseItem } from './types';

type Props<T extends FuseItem> = {
  readonly item: T;
  readonly className: string;
  readonly onSelect: (selected: T) => void;
}

export default <T extends FuseItem>({ item, className, onSelect }: Props<T>): ReactElement => (
  <button type="button" className={className} onClick={() => onSelect(item)}>
    {item.value}
  </button>
);
