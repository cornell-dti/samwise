/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */

import React, { ReactElement } from 'react';
import styles from './CheckBox.module.scss';

type Props = {
  readonly checked: boolean; // whether the box is initially checked
  readonly onChange: (checked: boolean) => void; // called when the value changed.
  readonly disabled?: boolean; // whether the checkbox is disabled.
  readonly inverted?: boolean; // whether the color is inverted.
  readonly className?: string; // additional className to apply
};

/**
 * This is the checkbox that implements designers' minimalist design.
 */
export default function CheckBox({
  checked,
  onChange,
  disabled = false,
  inverted = false,
  className = undefined,
}: Props): ReactElement {
  let allClassNames = className === undefined ? styles.CheckBox : `${className} ${styles.CheckBox}`;
  if (inverted) {
    allClassNames = `${allClassNames} ${styles.InvertedCheckBox}`;
  }
  const handleClick = (): void => {
    if (!disabled) {
      onChange(!checked);
    }
  };
  return (
    <label className={allClassNames}>
      <input
        tabIndex={0}
        defaultChecked={checked}
        onClick={handleClick}
        disabled={disabled}
        type="checkbox"
      />
      {checked && <span className={styles.CheckBoxCheckMark} />}
    </label>
  );
}
