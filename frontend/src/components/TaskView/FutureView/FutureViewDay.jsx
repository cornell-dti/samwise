// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { CompoundTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewDay.css';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';
import {
  floatingViewWidth,
  nDaysViewHeaderHeight,
  otherViewsHeightHeader,
  taskContainerHeightNDaysView,
  taskContainerHeightOtherViews, taskHeight,
} from './future-view-css-props';
import { day2String } from '../../../util/datetime-util';
import windowSizeConnect from '../../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../../Util/Responsive/window-size-context';
import { error } from '../../../util/general-util';

type Props = {|
  +date: Date;
  +tasks: CompoundTask[];
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +windowSize: WindowSize;
|};

type State = {|
  +floatingViewOpened: boolean;
|};

type PropsForPositionComputation = {|
  +tasks: CompoundTask[];
  +inNDaysView: boolean;
  +windowSize: WindowSize;
  +mainViewPosition: {| +width: number; +height: number; +top: number; +left: number; |};
|};
type PositionStyle = {|
  +width: string;
  +height: string;
  +top: string;
  +left: string;
|};

/**
 * Returns the total number of tasks in the given task array.
 *
 * @param {CompoundTask[]} tasks the given task array.
 * @param {boolean} includeSubTasks whether to include subtasks.
 * @return {number} total number of tasks, including main task and subtasks.
 */
const countTasks = (tasks: CompoundTask[], includeSubTasks: boolean): number => {
  if (!includeSubTasks) {
    return tasks.length;
  }
  const subtaskReducer = v => v + 1;
  const reducer = (a: number, t: CompoundTask): number => (
    a + 1 + t.filtered.subtaskArray.reduce(subtaskReducer, 0)
  );
  return tasks.reduce(reducer, 0);
};

/**
 * Returns the computed floating view style from some properties.
 *
 * @return the computed style.
 */
const computeFloatingViewStyle = (props: PropsForPositionComputation): PositionStyle => {
  const {
    tasks, inNDaysView, windowSize,
    mainViewPosition: {
      width, height, top, left,
    },
  } = props;
  // Compute the height of inner content
  const headerHeight = inNDaysView ? nDaysViewHeaderHeight : otherViewsHeightHeader;
  const tasksHeight = taskHeight * countTasks(tasks, inNDaysView);
  const totalHeight = headerHeight + tasksHeight;
  // Decide the maximum allowed height and the actual height
  const maxAllowedHeight = inNDaysView ? 400 : 300;
  const floatingViewHeight = Math.min(totalHeight, maxAllowedHeight);
  // Compute ideal offset
  let topOffset = (height - floatingViewHeight) / 2;
  let leftOffset = (width - floatingViewWidth) / 2;
  // Correct the offsets if they overflow.
  {
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;
    const topAbsolutePosition = top + topOffset;
    if (topAbsolutePosition < 0) {
      topOffset -= topAbsolutePosition;
    } else {
      const bottomAbsolutePosition = topAbsolutePosition + floatingViewHeight;
      const diff = bottomAbsolutePosition - windowHeight;
      if (diff > 0) {
        topOffset -= diff;
      }
    }
    const leftAbsolutePosition = left + leftOffset;
    if (leftAbsolutePosition < 0) {
      leftOffset -= leftAbsolutePosition;
    } else {
      const rightAbsolutePosition = leftAbsolutePosition + floatingViewWidth;
      const diff = rightAbsolutePosition - windowWidth;
      if (diff > 0) {
        leftOffset -= diff;
      }
    }
  }
  return {
    width: `${floatingViewWidth}px`,
    height: `${floatingViewHeight}px`,
    top: `${topOffset}px`,
    left: `${leftOffset}px`,
  };
};

/**
 * The component that renders all tasks on a certain day.
 */
class FutureViewDay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { floatingViewOpened: false };
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
    const { tasks, inNDaysView } = this.props;
    const totalRequiredHeight = taskHeight * countTasks(tasks, inNDaysView);
    const actualHeight = inNDaysView
      ? taskContainerHeightNDaysView
      : taskContainerHeightOtherViews;
    return totalRequiredHeight > actualHeight;
  };

  /**
   * Compute the floating view position.
   *
   * @return {PositionStyle} the floating view position.
   */
  computeFloatingViewPosition = (): PositionStyle => {
    const componentDiv = this.backlogDayElement ?? error('Impossible Case!');
    const boundingRect = componentDiv.getBoundingClientRect();
    if (!(boundingRect instanceof DOMRect)) {
      throw new Error('Bad boundingRect!');
    }
    const {
      width, height, top, left,
    } = boundingRect;
    const mainViewPosition = {
      width, height, top, left,
    };
    const { date, taskEditorPosition, ...positionProps } = this.props;
    return computeFloatingViewStyle({ ...positionProps, mainViewPosition });
  };

  /**
   * Open the floating view.
   */
  openFloatingView = () => this.setState({ floatingViewOpened: true });

  /**
   * Close the floating view.
   */
  closeFloatingView = () => this.setState({ floatingViewOpened: false });

  /**
   * Render the main content.
   *
   * @param {boolean} inMainList whether the header is in main list as opposed to floating list.
   * @return {*} the rendered header component.
   */
  renderContent = (inMainList: boolean): Node => {
    const {
      date, tasks, inNDaysView, taskEditorPosition,
    } = this.props;
    const isToday = this.isToday();
    const dateNumCssClass = inNDaysView
      ? styles.DateNumNDaysView
      : styles.DateNumOtherViews;
    const containerStyle = (inNDaysView && inMainList) ? { paddingTop: '1em' } : {};
    return (
      <React.Fragment>
        <div className={styles.DateInfo} style={containerStyle}>
          {inNDaysView && (
            <div className={styles.DateInfoDay}>
              {isToday ? 'TODAY' : day2String(date.getDay())}
            </div>
          )}
          <div className={dateNumCssClass}>{date.getDate()}</div>
        </div>
        <FutureViewDayTaskContainer
          tasks={tasks}
          inNDaysView={inNDaysView}
          taskEditorPosition={taskEditorPosition}
          isInMainList={inMainList}
        />
      </React.Fragment>
    );
  };

  /**
   * Render the body inside the day wrapper.
   *
   * @return {Node} the rendered body.
   */
  renderBody = (): Node => {
    if (!this.doesOverFlow()) {
      return this.renderContent(true);
    }
    const { floatingViewOpened } = this.state;
    if (!floatingViewOpened) {
      return (
        <React.Fragment>
          {this.renderContent(true)}
          <button type="button" className={styles.MoreTasksBar} onClick={this.openFloatingView}>
            More Tasks...
          </button>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <div className={styles.FloatingViewPrevPadding} />
        <div
          role="presentation"
          className={styles.FloatingBackgroundBlocker}
          onClick={this.closeFloatingView}
        />
        <div className={styles.FloatingView} style={this.computeFloatingViewPosition()}>
          {this.renderContent(false)}
        </div>
      </React.Fragment>
    );
  };

  backlogDayElement: ?HTMLDivElement;

  render(): Node {
    const { inNDaysView } = this.props;
    let wrapperCssClass: string;
    if (inNDaysView) {
      wrapperCssClass = this.isToday()
        ? `${styles.NDaysView} ${styles.Today}` : styles.NDaysView;
    } else {
      wrapperCssClass = styles.OtherViews;
    }
    return (
      <div className={wrapperCssClass} ref={(e) => { this.backlogDayElement = e; }}>
        {this.renderBody()}
      </div>
    );
  }
}

const ConnectedFutureViewDay = windowSizeConnect<Props>(FutureViewDay);
export default ConnectedFutureViewDay;
