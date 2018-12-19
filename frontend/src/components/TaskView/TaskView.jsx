// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import type { FutureViewDisplayOption } from './FutureView/future-view-types';
import FutureViewSwitcher from './FutureView/FutureViewSwitcher';
import FutureViewDaysContainer from './FutureView/FutureViewDaysContainer';
import FocusView from './FocusView/FocusView';
import { getBacklogHeaderTitle } from './FutureView/future-view-util';
import SquareIconButton from '../UI/SquareIconButton';
import SquareTextButton from '../UI/SquareTextButton';
import styles from './TaskView.css';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';

type Props = {|
  +windowSize: WindowSize;
|};

type State = {|
  +doesShowFocusView: boolean;
  +doesShowCompletedTasks: boolean;
  +displayOption: FutureViewDisplayOption;
  +backlogOffset: number;
|};

class TaskView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      doesShowFocusView: true,
      doesShowCompletedTasks: true,
      displayOption: 'N_DAYS',
      backlogOffset: 0,
    };
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Window Size Responsive Computations
   * --------------------------------------------------------------------------------
   */

  /**
   * Compute the number of days in n-days mode.
   *
   * @return {number} the number of days in n-days mode.
   */
  nDays = (): number => {
    const { windowSize: { width } } = this.props;
    if (width > 960) {
      return 5;
    }
    if (width > 768) {
      return 4;
    }
    return 1;
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 2: ???
   * --------------------------------------------------------------------------------
   */

  /**
   * Handler for toggling the focus view. In n-days mode, it cannot be toggled.
   */
  toggleFocusView = (): void => {
    this.setState((oldState: State) => {
      const { doesShowFocusView, doesShowCompletedTasks, displayOption } = oldState;
      switch (displayOption) {
        case 'N_DAYS':
          return oldState;
        case 'BIWEEKLY':
        case 'MONTHLY':
          return { doesShowFocusView: !doesShowFocusView, doesShowCompletedTasks, displayOption };
        default:
          return oldState;
      }
    });
  };

  /**
   * Change the current offset in backlog.
   *
   * @param newOffsetInstruction 'TODAY' to reset, 'PREV' to go back, 'NEXT' to move forward.
   * @return {function(): void} the handler for changing offset.
   */
  changeBacklogOffset = (newOffsetInstruction: 'TODAY' | 'PREV' | 'NEXT') => (): void => {
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
  };

  /**
   * Handler for toggling completed tasks.
   */
  toggleCompletedTasks = (): void => {
    this.setState((oldState: State) => ({
      ...oldState, doesShowCompletedTasks: !oldState.doesShowCompletedTasks,
    }));
  };

  /**
   * Change the current view of the backlog.
   *
   * @param {number} nDays number of days in n-days view.
   * @return {function(FutureViewDisplayOption): void} the handler for view switching.
   */
  switchBacklogView = (nDays: number) => (newDisplayOption: FutureViewDisplayOption): void => {
    this.setState((oldState: State) => {
      const {
        doesShowFocusView, doesShowCompletedTasks, displayOption, backlogOffset,
      } = oldState;
      let dayOffset: number;
      switch (displayOption) {
        case 'N_DAYS':
          dayOffset = backlogOffset * nDays;
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
        case 'N_DAYS':
          newDoesShowFocusView = true;
          newOffset = Math.floor(dayOffset / 4);
          break;
        case 'BIWEEKLY':
          newDoesShowFocusView = displayOption === 'N_DAYS' ? false : doesShowFocusView;
          newOffset = Math.floor(dayOffset / 14);
          break;
        case 'MONTHLY':
          newDoesShowFocusView = displayOption === 'N_DAYS' ? false : doesShowFocusView;
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
  };

  /**
   * Render the toggle for focus view.
   *
   * @return {Node} the rendered component.
   */
  renderFocusViewToggleComponent = (): Node => {
    const { doesShowFocusView, displayOption } = this.state;
    if (displayOption === 'N_DAYS') {
      return null;
    }
    const wrapperStyle = doesShowFocusView ? { left: '-5em' } : { left: '-1em' };
    const buttonStyle = doesShowFocusView ? { left: '2em' } : {};
    const iconName = doesShowFocusView ? 'chevron left' : 'chevron right';
    const iconClass = doesShowFocusView
      ? styles.TaskViewFocusViewToggleIconFocusViewShow
      : styles.TaskViewFocusViewToggleIconFocusViewHide;
    return (
      <div className={styles.TaskViewFocusViewToggleWrapper} style={wrapperStyle}>
        <div
          role="button"
          tabIndex={-1}
          className={styles.TaskViewFocusViewToggle}
          style={buttonStyle}
          onClick={this.toggleFocusView}
          onKeyDown={this.toggleFocusView}
        >
          <Icon name={iconName} className={iconClass} />
        </div>
      </div>
    );
  };

  /**
   * Render the backlog component.
   *
   * @return {Node} the rendered component.
   */
  renderBacklogComponent = (): Node => {
    const {
      doesShowCompletedTasks, displayOption, backlogOffset,
    } = this.state;
    const backlogTodayButton = backlogOffset !== 0 && (
      <SquareTextButton text="Today" onClick={this.changeBacklogOffset('TODAY')} />
    );
    const nDays = this.nDays();
    const backlogNav = displayOption === 'N_DAYS' ? (
      <React.Fragment>
        {
          backlogOffset >= 1 && (
            <Icon
              className={styles.TaskViewNavButton}
              name="chevron left"
              onClick={this.changeBacklogOffset('PREV')}
            />
          )
        }
        <Icon
          className={styles.TaskViewNavButton}
          name="chevron right"
          onClick={this.changeBacklogOffset('NEXT')}
        />
        <span className={styles.TaskViewControlPadding} />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <span className={styles.TaskViewControlPadding} />
        {
          (backlogOffset >= 1 || (backlogOffset >= 0 && displayOption === 'BIWEEKLY')) && (
            <Icon
              className={styles.TaskViewNavButton}
              name="chevron left"
              onClick={this.changeBacklogOffset('PREV')}
            />
          )
        }
        <h3 className={styles.TaskViewControlTitle}>
          {getBacklogHeaderTitle(nDays, displayOption, backlogOffset)}
        </h3>
        <Icon
          className={styles.TaskViewNavButton}
          name="chevron right"
          onClick={this.changeBacklogOffset('NEXT')}
        />
        <span className={styles.TaskViewControlPadding} />
      </React.Fragment>
    );
    const toggleCompletedTasksButton = (
      <SquareIconButton
        active={doesShowCompletedTasks}
        activeIconName="eye slash"
        inactiveIconName="eye"
        onClick={this.toggleCompletedTasks}
      />
    );
    return (
      <div className={styles.TaskViewFuturePanel}>
        {this.renderFocusViewToggleComponent()}
        <div className={styles.TaskViewControl}>
          <h3 className={styles.TaskViewControlTitle}>Future</h3>
          {backlogTodayButton}
          {backlogNav}
          {toggleCompletedTasksButton}
          <FutureViewSwitcher nDays={nDays} onChange={this.switchBacklogView(nDays)} />
        </div>
        <FutureViewDaysContainer
          nDays={nDays}
          doesShowCompletedTasks={doesShowCompletedTasks}
          displayOption={displayOption}
          backlogOffset={backlogOffset}
        />
      </div>
    );
  };

  render(): Node {
    const { doesShowFocusView } = this.state;
    const focusViewComponent = doesShowFocusView && (
      <div className={styles.TaskViewFocusPanel}>
        <h3 className={styles.TaskViewControlTitle}>Focus</h3>
        <FocusView />
      </div>
    );
    return (
      <div className={styles.TaskView}>
        {focusViewComponent}
        {this.renderBacklogComponent()}
      </div>
    );
  }
}

const ConnectedTaskView = windowSizeConnect<Props>(TaskView);
export default ConnectedTaskView;
