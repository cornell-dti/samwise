// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import styles from './BacklogDay.css';
import BacklogDayTaskContainer from './BacklogDayTaskContainer';
import { countTasks, day2String } from './backlog-util';

type Props = {|
  +date: Date;
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
|};
type State = {| doesShowFloatingTaskList: boolean; |};

/**
 * Height of the task container in four days view.
 * @type {number}
 */
const taskContainerHeightFourDaysView = 284;
/**
 * Height of the task container in other views.
 * @type {number}
 */
const taskContainerHeightOtherViews = 151;
/**
 * Height of each task line in display.
 * @type {number}
 */
const taskHeight = 25;

/**
 * The component that renders all tasks on a certain day.
 */
export default class BacklogDay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { doesShowFloatingTaskList: false };
  }

  /**
   * Report whether the day is today.
   *
   * @return {boolean} whether the day is today.
   */
  isToday = (): boolean => {
    const { date } = this.props;
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  };

  /**
   * Report whether the container will overflow.
   *
   * @return {boolean} whether the container overflows.
   */
  doesOverFlow = (): boolean => {
    const { tasks, inFourDaysView, doesShowCompletedTasks } = this.props;
    const totalRequiredHeight = taskHeight * countTasks(
      tasks, inFourDaysView, doesShowCompletedTasks,
    );
    const actualHeight = inFourDaysView
      ? taskContainerHeightFourDaysView
      : taskContainerHeightOtherViews;
    return totalRequiredHeight > actualHeight;
  };

  /**
   * Toggle the floating task list.
   */
  toggleFloatingTaskList = (): void => this.setState(({ doesShowFloatingTaskList }: State) => ({
    doesShowFloatingTaskList: !doesShowFloatingTaskList,
  }));

  /**
   * Render the header component.
   *
   * @param {boolean} isToday whether the day is today.
   * @return {*} the rendered header component.
   */
  renderHeader = (isToday: boolean): Node => {
    const { date, inFourDaysView } = this.props;
    const dateNumCssClass = inFourDaysView
      ? styles.BacklogDayDateInfoDateNumFourDaysView
      : styles.BacklogDayDateInfoDateNumOtherViews;
    const containerStyle = inFourDaysView ? { paddingTop: '1em' } : {};
    return (
      <div className={styles.BacklogDayDateInfo} style={containerStyle}>
        {
          inFourDaysView && (
            <div className={styles.BacklogDayDateInfoDay}>
              {isToday ? 'TODAY' : day2String(date.getDay())}
            </div>
          )
        }
        <div className={dateNumCssClass}>{date.getDate()}</div>
      </div>
    );
  };

  /**
   * Render the overflow component.
   *
   * @return {Node} the rendered overflow component
   */
  renderOverflowComponent = (): Node => {
    const { doesShowFloatingTaskList } = this.state;
    if (!this.doesOverFlow()) {
      return null;
    }
    const toggleButton = (
      <button
        type="button"
        className={styles.BacklogDayMoreTasksBar}
        onClick={this.toggleFloatingTaskList}
      >
        More Tasks...
      </button>
    );
    if (!doesShowFloatingTaskList) {
      return toggleButton;
    }
    const blockerNode = (
      <div
        className={styles.BacklogDayFloatingViewBackgroundBlocker}
        role="button"
        tabIndex={-1}
        onClick={this.toggleFloatingTaskList}
        onKeyDown={this.toggleFloatingTaskList}
      />
    );
    const { date, ...rest } = this.props;
    const tasksListNode = (
      <div className={styles.BacklogDayFloatingView}>
        {this.renderHeader(this.isToday())}
        <BacklogDayTaskContainer {...rest} hideOverflow={false} />
      </div>
    );
    return (
      <React.Fragment>
        {toggleButton}
        {blockerNode}
        {tasksListNode}
      </React.Fragment>
    );
  };

  render(): Node {
    const {
      tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
    } = this.props;
    const isToday = this.isToday();
    let wrapperCssClass: string;
    if (inFourDaysView) {
      wrapperCssClass = isToday
        ? `${styles.BacklogDayFourDaysView} ${styles.BacklogToday}`
        : styles.BacklogDayFourDaysView;
    } else {
      wrapperCssClass = styles.BacklogDayOtherView;
    }
    return (
      <div className={wrapperCssClass}>
        {this.renderHeader(isToday)}
        <BacklogDayTaskContainer
          tasks={tasks}
          inFourDaysView={inFourDaysView}
          doesShowCompletedTasks={doesShowCompletedTasks}
          taskEditorPosition={taskEditorPosition}
          hideOverflow
        />
        {this.renderOverflowComponent()}
      </div>
    );
  }
}
