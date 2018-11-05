// @flow strict
/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */

import * as React from 'react';
import type { Node } from 'react';
import type { BacklogDisplayOption } from './backlog-types';
import styles from './BacklogHeaderButtons.css';

type Props = {| +onChange: (option: BacklogDisplayOption) => void |};
type State = {| +displayOption: BacklogDisplayOption |};

/**
 * The component used to render a switcher for different backlog views.
 */
export default class BacklogViewSwitcher extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayOption: 'FOUR_DAYS' };
  }

  render(): Node {
    const { onChange } = this.props;
    const { displayOption } = this.state;
    const setDisplayOption = (newDisplayOption: BacklogDisplayOption) => (
      () => {
        onChange(newDisplayOption); // report to parent component
        this.setState({ displayOption: newDisplayOption });
      }
    );
    const renderButton = (option: BacklogDisplayOption, text: string) => {
      const className = displayOption === option
        ? `${styles.BacklogViewSwitcherButton} ${styles.BacklogViewSwitcherActiveButton}`
        : styles.BacklogViewSwitcherButton;
      return (
        <div className={className} onClick={setDisplayOption(option)}>
          <span className={styles.BacklogViewSwitcherButtonText}>{text}</span>
        </div>
      );
    };
    return (
      <div className={styles.BacklogViewSwitcher}>
        {renderButton('FOUR_DAYS', '4D')}
        {renderButton('BIWEEKLY', '2W')}
        {renderButton('MONTHLY', 'M')}
      </div>
    );
  }
}
