// @flow strict
/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */

import * as React from 'react';
import type { Node } from 'react';
import styles from './CheckBox.css';

type Props = {|
  className?: string;
  checked?: boolean;
  inverted?: boolean;
  +onChange: (checked: boolean) => any;
|};

type State = {| +checked: boolean |};

/**
 * This is the checkbox that implements the minimalist design.
 */
export default class CheckBox extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
    checked: false,
  };

  constructor(props: Props) {
    super(props);
    const { checked } = props;
    this.state = { checked: checked || false };
  }

  /**
   * Handle the click of the checkbox.
   */
  handleClick() {
    const { onChange } = this.props;
    this.setState(({ checked }: State) => {
      const newChecked: boolean = !checked;
      if (checked !== newChecked) {
        onChange(newChecked);
      }
      return { checked: newChecked };
    });
  }

  render(): Node {
    const { className, inverted } = this.props;
    const { checked } = this.state;
    let allClassNames = className ? `${className} ${styles.CheckBox}` : styles.CheckBox;
    if (inverted) {
      allClassNames = `${allClassNames} ${styles.InvertedCheckBox}`;
    }
    const checkMarkDisplayStyle = { display: checked ? 'block' : 'none' };
    return (
      <label className={allClassNames}>
        <input
          defaultChecked={checked}
          onClick={() => this.handleClick()}
          type="checkbox"
        />
        <span className={styles.CheckBoxCheckMark} style={checkMarkDisplayStyle} />
      </label>
    );
  }
}
