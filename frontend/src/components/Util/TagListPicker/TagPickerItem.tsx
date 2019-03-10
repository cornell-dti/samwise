import React, { ReactElement } from 'react';

type Props = {
  readonly color: string;
  readonly title: string;
  readonly id: string;
  readonly onChange: (tag: string) => void;
};

/**
 * One item in the class picker.
 */
export default function TagPickerItem({ id, color, title, onChange }: Props): ReactElement {
  const style = { '--custom-color': color };
  return (
    // @ts-ignore this is a hack to use the :before selector. We should try to find better ways.
    <li style={style}>
      <input onClick={() => onChange(id)} type="checkbox" />
      {title}
    </li>
  );
}
