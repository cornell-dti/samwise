// @flow strict

import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import type { BacklogDisplayOption } from '../Backlog/backlog-types';
import BacklogViewSwitcher from '../Backlog/BacklogViewSwitcher';
import BacklogDaysContainer from '../Backlog/BacklogDaysContainer';
import FocusView from '../FocusView/focusView';
import styles from './TaskView.css';
import BacklogCompletedTasksToggle from '../Backlog/BacklogCompletedTasksToggle';
import BacklogHeaderTextButton from '../Backlog/BacklogHeaderTextButton';
import { getBacklogHeaderTitle } from '../Backlog/backlog-util';

type Props = {||};

type State = {|
  +doesShowFocusView: boolean;
  +doesShowCompletedTasks: boolean;
  +displayOption: BacklogDisplayOption;
  +backlogOffset: number;
|};

export default class TaskView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      doesShowFocusView: true,
      doesShowCompletedTasks: true,
      displayOption: 'FOUR_DAYS',
      backlogOffset: 0,
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

  /**
   * Change the current offset in backlog.
   *
   * @param newOffsetInstruction 'TODAY' to reset, 'PREV' to go back, 'NEXT' to move forward.
   */
  changeBacklogOffset(newOffsetInstruction: 'TODAY' | 'PREV' | 'NEXT') {
    this.setState((oldState: State) => {
      const { backlogOffset } = oldState;
      let newOffset: number;
      switch (newOffsetInstruction) {
        case 'TODAY':
          newOffset = 0;
          break;
        case 'PREV':
          newOffset = backlogOffset - 1;
          break;
        case 'NEXT':
          newOffset = backlogOffset + 1;
          break;
        default:
          throw new Error('Bad offset instruction!');
      }
      return { ...oldState, backlogOffset: newOffset };
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
      const {
        doesShowFocusView, doesShowCompletedTasks, displayOption, backlogOffset,
      } = oldState;
      let dayOffset: number;
      switch (displayOption) {
        case 'FOUR_DAYS':
          dayOffset = backlogOffset;
          break;
        case 'BIWEEKLY':
          dayOffset = backlogOffset * 14;
          break;
        case 'MONTHLY':
          dayOffset = backlogOffset * 30;
          break;
        default:
          throw new Error('Bad display option');
      }
      let newDoesShowFocusView: boolean;
      let newOffset: number;
      switch (newDisplayOption) {
        case 'FOUR_DAYS':
          newDoesShowFocusView = true;
          newOffset = dayOffset;
          break;
        case 'BIWEEKLY':
          newDoesShowFocusView = displayOption === 'FOUR_DAYS' ? false : doesShowFocusView;
          newOffset = Math.floor(dayOffset / 14);
          break;
        case 'MONTHLY':
          newDoesShowFocusView = displayOption === 'FOUR_DAYS' ? false : doesShowFocusView;
          newOffset = Math.floor(dayOffset / 30);
          break;
        default:
          throw new Error('Bad display option');
      }
      return {
        doesShowFocusView: newDoesShowFocusView,
        doesShowCompletedTasks,
        displayOption: newDisplayOption,
        backlogOffset: newOffset,
      };
    });
  }

  render() {
    const {
      doesShowFocusView, doesShowCompletedTasks, displayOption, backlogOffset,
    } = this.state;
    const focusViewComponent = doesShowFocusView && (
      <div className={styles.TaskViewFocusPanel}>
        <h3>{'Today\'s focus'}</h3>
        <FocusView />
      </div>
    );
    const backlogTodayButton = (
      <BacklogHeaderTextButton
        text="Today"
        onClick={() => this.changeBacklogOffset('TODAY')}
      />
    );
    const backlogNavButtons = displayOption !== 'FOUR_DAYS' && (
      <React.Fragment>
        <Icon
          className={styles.TaskViewNavButton}
          name="chevron left"
          onClick={() => this.changeBacklogOffset('PREV')}
        />
        <Icon
          className={styles.TaskViewNavButton}
          name="chevron right"
          onClick={() => this.changeBacklogOffset('NEXT')}
        />
      </React.Fragment>
    );
    const toggleCompletedTasksButton = (
      <BacklogCompletedTasksToggle
        onChange={() => this.toggleCompletedTasks()}
      />
    );
    const backlogComponent = (
      <div className={styles.TaskViewFuturePanel}>
        <div className={styles.TaskViewControl}>
          <h3 className={styles.TaskViewControlTitle}>Future</h3>
          {backlogTodayButton}
          {backlogNavButtons}
          <span className={styles.TaskViewControlPadding} />
          <h4>{getBacklogHeaderTitle(displayOption, backlogOffset)}</h4>
          <span className={styles.TaskViewControlPadding} />
          {toggleCompletedTasksButton}
          <BacklogViewSwitcher onChange={option => this.switchBacklogView(option)} />
        </div>
        <BacklogDaysContainer
          doesShowCompletedTasks={doesShowCompletedTasks}
          displayOption={displayOption}
          backlogOffset={backlogOffset}
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
