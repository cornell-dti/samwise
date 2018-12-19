// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { FutureViewDisplayOption } from './future-view-types';
import styles from './FutureViewHeaderButtons.css';

type Props = {| +onChange: (option: FutureViewDisplayOption) => void |};
type State = {| +displayOption: FutureViewDisplayOption |};

/**
 * The component used to render a switcher for different backlog views.
 */
export default class FutureViewSwitcher extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayOption: 'FOUR_DAYS' };
  }

  render(): Node {
    const { onChange } = this.props;
    const { displayOption } = this.state;
    const setDisplayOption = (newDisplayOption: FutureViewDisplayOption) => (
      () => {
        onChange(newDisplayOption); // report to parent component
        this.setState({ displayOption: newDisplayOption });
      }
    );
    const renderButton = (option: FutureViewDisplayOption, text: string) => {
      const className = displayOption === option
        ? `${styles.ViewSwitcherButton} ${styles.ViewSwitcherActiveButton}`
        : styles.ViewSwitcherButton;
      return (
        <button
          className={className}
          type="button"
          onClick={setDisplayOption(option)}
        >
          <span className={styles.ViewSwitcherButtonText}>{text}</span>
        </button>
      );
    };
    return (
      <div className={styles.ViewSwitcher}>
        {renderButton('FOUR_DAYS', '4D')}
        {renderButton('BIWEEKLY', '2W')}
        {renderButton('MONTHLY', 'M')}
      </div>
    );
  }
}
