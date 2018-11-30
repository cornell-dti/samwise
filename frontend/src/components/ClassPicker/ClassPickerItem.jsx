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
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered item.
 * @constructor
 */
export default function ClassPickerItem(props: Props): Node {
  const {
    id, color, title, onChange,
  } = props;
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
