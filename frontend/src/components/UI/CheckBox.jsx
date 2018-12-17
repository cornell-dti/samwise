// @flow strict
/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */

import React from 'react';
import type { Node } from 'react';
import styles from './CheckBox.css';

type Props = {|
  className?: string; // additional className to apply
  checked?: boolean; // whether the box is initially checked
  inverted?: boolean; // whether the color is inverted.
  +onChange: (checked: boolean) => any; // called when the value changed.
|};

type State = {| +checked: boolean |};

/**
 * This is the checkbox that implements the minimalist design.
 */
export default class CheckBox extends React.PureComponent<Props, State> {
  static defaultProps = {
    className: '',
    checked: false,
    inverted: false,
  };

  constructor(props: Props) {
    super(props);
    const { checked } = props;
    this.state = { checked: checked || false };
  }

  componentDidUpdate({ checked }: Props, prevState: State) {
    if (checked !== prevState.checked) {
      // I have to disable this lint because I don't know any other way to solve it.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ checked });
    }
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
    let { checked } = this.state;
    // eslint-disable-next-line react/destructuring-assignment
    const checkedNotNull = this.props.checked || false;
    const invertedNotNull = inverted || false;
    if (checkedNotNull !== checked) {
      checked = checkedNotNull;
    }
    let allClassNames = className != null ? `${className} ${styles.CheckBox}` : styles.CheckBox;
    if (invertedNotNull) {
      allClassNames = `${allClassNames} ${styles.InvertedCheckBox}`;
    }
    const checkMarkDisplayStyle = { display: checked ? 'block' : 'none' };
    return (
      <label className={allClassNames}>
        <input
          tabIndex={-1}
          defaultChecked={checked}
          onClick={() => this.handleClick()}
          type="checkbox"
        />
        <span className={styles.CheckBoxCheckMark} style={checkMarkDisplayStyle} />
      </label>
    );
  }
}
