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
export default function TagPickerItem({ id, color, title, onChange }: Props,): ReactElement {
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
