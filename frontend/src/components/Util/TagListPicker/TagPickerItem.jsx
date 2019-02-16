// @flow strict

import * as React from 'react';
import type { Node } from 'react';

type Props = {|
  +color: string;
  +title: string;
  +id: string;
  +onChange: (string) => void;
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
        onClick={() => onChange(id)}
        type="checkbox"
      />
      {title}
    </li>
  );
}
