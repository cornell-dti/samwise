// @flow strict

import * as React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import type { BacklogDisplayOption } from '../Backlog/backlog-types';
import BacklogViewSwitcher from '../Backlog/BacklogViewSwitcher';
import BacklogDaysContainer from '../Backlog/BacklogDaysContainer';
import FocusView from '../FocusView/focusView';
import styles from './TaskView.css';

type Props = {||};

type State = {|
  doesShowFocusView: boolean;
  doesShowCompletedTasks: boolean;
  displayOption: BacklogDisplayOption;
|};

export default class TaskView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      doesShowFocusView: true,
      doesShowCompletedTasks: true,
      displayOption: 'FOUR_DAYS',
    };
  }

  /**
   * Toggle the focus view. In four-days mode, it cannot be toggled.
   */
  toggleFocusView() {
    this.setState((oldState: State) => {
      const { doesShowFocusView, doesShowCompletedTasks, displayOption } = oldState;
      switch (displayOption) {
        case 'FOUR_DAYS':
          return oldState;
        case 'BIWEEKLY':
        case 'MONTHLY':
          return { doesShowFocusView: !doesShowFocusView, doesShowCompletedTasks, displayOption };
        default:
          return oldState;
      }
    });
  }

  toggleCompletedTasks() {
    this.setState((oldState: State) => ({
      ...oldState, doesShowCompletedTasks: !oldState.doesShowCompletedTasks,
    }));
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
    const { doesShowFocusView, doesShowCompletedTasks, displayOption } = this.state;
    const focusViewComponent = doesShowFocusView && (
      <div className={styles.TaskViewFocusPanel}>
        <h3>{'Today\'s focus'}</h3>
        <FocusView />
      </div>
    );
    const toggleFocusViewButton = displayOption !== 'FOUR_DAYS' && (
      <Button
        className={styles.TaskViewControlButton}
        active={doesShowFocusView}
        onClick={() => this.toggleFocusView()}
      >
        {doesShowFocusView ? 'Hide Focus' : 'Show Focus'}
      </Button>
    );
    const toggleCompletedTasksButton = (
      <Button
        className={styles.TaskViewControlButton}
        onClick={() => this.toggleCompletedTasks()}
      >
        <Icon name={doesShowCompletedTasks ? 'eye slash' : 'eye'} />
      </Button>
    );
    const backlogComponent = (
      <div className={styles.TaskViewFuturePanel}>
        <div className={styles.TaskViewControl}>
          <h3 className={styles.TaskViewControlTitle}>Future</h3>
          {toggleFocusViewButton}
          <Button className={styles.TaskViewControlButton}>Today</Button>
          <span className={styles.TaskViewControlPadding} />
          {toggleCompletedTasksButton}
          <BacklogViewSwitcher onChange={option => this.switchBacklogView(option)} />
        </div>
        <BacklogDaysContainer
          displayOption={displayOption}
          doesShowCompletedTasks={doesShowCompletedTasks}
        />
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
