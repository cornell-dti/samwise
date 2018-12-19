// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import type { FutureViewDisplayOption } from './FutureView/future-view-types';
import FutureViewSwitcher from './FutureView/FutureViewSwitcher';
import FutureView from './FutureView/FutureView';
import FocusView from './FocusView/FocusView';
import { date2YearMonth } from '../../util/datetime-util';
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

/**
 * Returns a suitable title for the backlog header title.
 *
 * @param {number} backlogOffset offset of displaying days.
 * @return {string} a suitable title for the backlog header title.
 */
function getMonthlyViewHeaderTitle(backlogOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + backlogOffset, 1);
  return date2YearMonth(d);
}

class TaskView extends React.PureComponent<Props, State> {
  state: State = {
    doesShowFocusView: true,
    doesShowCompletedTasks: true,
    displayOption: 'N_DAYS',
    backlogOffset: 0,
  };

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
      ? styles.FocusViewToggleIconFocusViewShow
      : styles.FocusViewToggleIconFocusViewHide;
    return (
      <div className={styles.FocusViewToggleWrapper} style={wrapperStyle}>
        <div
          role="button"
          tabIndex={-1}
          className={styles.FocusViewToggle}
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
   * Render the navigation for future view.
   *
   * @return {Node} the navigation for future view.
   */
  renderFutureViewNav = (): Node => {
    const { displayOption, backlogOffset } = this.state;
    const prevButton = (
      <Icon
        className={styles.NavButton}
        name="chevron left"
        onClick={this.changeBacklogOffset('PREV')}
      />
    );
    const nextButton = (
      <Icon
        className={styles.NavButton}
        name="chevron right"
        onClick={this.changeBacklogOffset('NEXT')}
      />
    );
    switch (displayOption) {
      case 'N_DAYS':
        return (
          <React.Fragment>
            {backlogOffset >= 1 && prevButton}
            {nextButton}
            <span className={styles.ControlPadding} />
          </React.Fragment>
        );
      case 'BIWEEKLY':
        return (
          <React.Fragment>
            {backlogOffset >= 0 && prevButton}
            {nextButton}
            <span className={styles.ControlPadding} />
          </React.Fragment>
        );
      case 'MONTHLY':
        return (
          <React.Fragment>
            <span className={styles.ControlPadding} />
            {backlogOffset >= 1 && prevButton}
            <h3 className={styles.ControlTitle}>
              {getMonthlyViewHeaderTitle(backlogOffset)}
            </h3>
            {nextButton}
            <span className={styles.ControlPadding} />
          </React.Fragment>
        );
      default:
        throw new Error('Bad display option.');
    }
  };

  /**
   * Render the future view component.
   *
   * @return {Node} the rendered component.
   */
  renderFutureViewComponent = (): Node => {
    const { doesShowCompletedTasks, displayOption, backlogOffset } = this.state;
    const nDays = this.nDays();
    return (
      <div className={styles.FuturePanel}>
        {this.renderFocusViewToggleComponent()}
        <div className={styles.TaskViewControl}>
          <h3 className={styles.ControlTitle}>Future</h3>
          {backlogOffset !== 0 && (
            <SquareTextButton text="Today" onClick={this.changeBacklogOffset('TODAY')} />
          )}
          {this.renderFutureViewNav()}
          <SquareIconButton
            active={doesShowCompletedTasks}
            iconNames={['eye slash', 'eye']}
            onToggle={this.toggleCompletedTasks}
          />
          <FutureViewSwitcher
            nDays={nDays}
            displayOption={displayOption}
            onChange={this.switchBacklogView(nDays)}
          />
        </div>
        <FutureView
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
      <div className={styles.FocusPanel}>
        <h3 className={styles.ControlTitle}>Focus</h3>
        <FocusView />
      </div>
    );
    return (
      <div className={styles.TaskView}>
        {focusViewComponent}
        {this.renderFutureViewComponent()}
      </div>
    );
  }
}

const ConnectedTaskView = windowSizeConnect<Props>(TaskView);
export default ConnectedTaskView;
