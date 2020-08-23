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
  const style: Record<string, string> = { '--custom-color': color };
  return (
    <li style={style}>
      <input onClick={() => onChange(id)} type="checkbox" />
      {title}
    </li>
  );
}
