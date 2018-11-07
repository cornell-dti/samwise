// @flow strict

import * as React from 'react';
import type { Node } from 'react';

type Props = {|
  +color: string;
  +title: string;
  +onChange: (SyntheticEvent<HTMLInputElement>) => void;
|};

/**
 * One item in the class picker.
 *
 * @param {string} color the color of the class.
 * @param {string} title the title of the class.
 * @param {function} onChange the function to call when choice changed.
 * @return {Node} the rendered item.
 * @constructor
 */
export default function ClassPickerItem({ color, title, onChange }: Props): Node {
  return (
    <li style={{ '--custom-color': color }}>
      <input
        data-color={color}
        data-class-title={title}
        onClick={onChange}
        type="checkbox"
      />
      {title}
    </li>
  );
}
