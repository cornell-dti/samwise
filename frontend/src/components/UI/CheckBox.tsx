/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */

import React, { MouseEvent, ReactElement } from 'react';
import styles from './CheckBox.css';

type Props = {
  readonly checked: boolean; // whether the box is initially checked
  readonly onChange: (checked: boolean) => void; // called when the value changed.
  readonly disabled: boolean; // whether the checkbox is disabled.
  readonly inverted: boolean; // whether the color is inverted.
  readonly className: string | null; // additional className to apply
};

/**
 * This is the checkbox that implements designers' minimalist design.
 */
export default function CheckBox(props: Props): ReactElement {
  const {
    checked, onChange, disabled, inverted, className,
  } = props;
  let allClassNames = className === null ? styles.CheckBox : `${className} ${styles.CheckBox}`;
  if (inverted) {
    allClassNames = `${allClassNames} ${styles.InvertedCheckBox}`;
  }
  const handleClick = (e: MouseEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };
  return (
    <label className={allClassNames}>
      <input
        tabIndex={-1}
        defaultChecked={checked}
        onClick={handleClick}
        disabled={disabled}
        type="checkbox"
      />
      {checked && (<span className={styles.CheckBoxCheckMark} />)}
    </label>
  );
}

CheckBox.defaultProps = { disabled: false, inverted: false, className: null };
