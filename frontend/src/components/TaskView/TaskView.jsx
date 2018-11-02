// @flow strict

import * as React from 'react';
import type { BacklogDisplayOption } from '../Backlog/backlog-types';
import BacklogViewSwitcher from '../Backlog/BacklogViewSwitcher';
import BacklogDaysContainer from '../Backlog/BacklogDaysContainer';
import FocusView from '../FocusView/focusView';
import styles from './TaskView.css';

type Props = {||};

type State = {|
  doesShowFocusView: boolean;
  displayOption: BacklogDisplayOption;
|};

export default class TaskView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      doesShowFocusView: true,
      displayOption: 'FOUR_DAYS',
    };
  }

  /**
   * Toggle the focus view. In four-days mode, it cannot be toggled.
   */
  toggleFocusView() {
    this.setState((oldState: State) => {
      const { doesShowFocusView, displayOption } = oldState;
      switch (displayOption) {
        case 'FOUR_DAYS':
          return oldState;
        case 'BIWEEKLY':
        case 'MONTHLY':
          return { doesShowFocusView: !doesShowFocusView, displayOption };
        default:
          return oldState;
      }
    });
  }

  /**
   * Change the current view of the backlog.
   *
   * @param newDisplayOption the new display option for backlog.
   */
  switchBacklogView(newDisplayOption: BacklogDisplayOption) {
    this.setState((oldState: State) => {
      const { doesShowFocusView, displayOption } = oldState;
      switch (newDisplayOption) {
        case 'FOUR_DAYS':
          return { doesShowFocusView: true, displayOption: newDisplayOption };
        case 'BIWEEKLY':
        case 'MONTHLY':
          return displayOption === 'FOUR_DAYS'
            ? { doesShowFocusView: false, displayOption: newDisplayOption }
            : { doesShowFocusView, displayOption: newDisplayOption };
        default:
          return oldState;
      }
    });
  }

  render() {
    const { doesShowFocusView, displayOption } = this.state;
    const focusViewComponent = doesShowFocusView && (
      <div className={styles.TaskViewFocusPanel}>
        <h3>{'Today\'s focus'}</h3>
        <FocusView />
      </div>
    );
    const backlogComponent = (
      <div className={styles.TaskViewFuturePanel}>
        <div className={styles.TaskViewControl}>
          <h3>Future</h3>
          <span className={styles.TaskViewControlPadding} />
          <BacklogViewSwitcher onChange={option => this.switchBacklogView(option)} />
        </div>
        <BacklogDaysContainer displayOption={displayOption} />
      </div>
    );
    return (
      <div className={styles.TaskView}>
        {focusViewComponent}
        {backlogComponent}
      </div>
    );
  }
}
