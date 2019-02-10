// @flow strict

import * as React from 'react';
import type { Node } from 'react';

type Props = {|
  +color: string;
  +title: string;
  +id: number;
  +onChange: (SyntheticEvent<HTMLInputElement>) => void;
|};

/**
 * One item in the class picker.
 */
export default function TagPickerItem(
  {
    id, color, title, onChange,
  }: Props,
): Node {
  return (
    <li style={{ '--custom-color': color }}>
      <input
        data-id={id}
        data-color={color}
        data-class-title={title}
        onClick={onChange}
        type="checkbox"
      />
      {title}
    </li>
  );
}
