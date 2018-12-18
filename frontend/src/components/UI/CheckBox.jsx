// @flow strict
/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */

import React from 'react';
import type { Node } from 'react';
import styles from './CheckBox.css';

type Props = {|
  +checked: boolean; // whether the box is initially checked
  +onChange: (checked: boolean) => any; // called when the value changed.
  +disabled: boolean; // whether the checkbox is disabled.
  +inverted: boolean; // whether the color is inverted.
  +className: string | null; // additional className to apply
|};

/**
 * This is the checkbox that implements the minimalist design.
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered checkbox.
 * @constructor
 */
export default function CheckBox(props: Props): Node {
  const {
    checked, onChange, disabled, inverted, className,
  } = props;
  let allClassNames = className === null ? styles.CheckBox : `${className} ${styles.CheckBox}`;
  if (inverted) {
    allClassNames = `${allClassNames} ${styles.InvertedCheckBox}`;
  }
  const handleClick = (e: SyntheticMouseEvent<HTMLInputElement>) => {
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

// eslint-disable-next-line react/default-props-match-prop-types
CheckBox.defaultProps = { disabled: false, inverted: false, className: null };
