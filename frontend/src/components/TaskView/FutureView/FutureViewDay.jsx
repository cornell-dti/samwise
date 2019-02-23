// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { CompoundTask, SimpleDate } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewDay.css';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';
import {
  floatingViewWidth,
  nDaysViewHeaderHeight,
  otherViewsHeightHeader,
  taskHeight,
} from './future-view-css-props';
import { day2String, getTodayAtZeroAM } from '../../../util/datetime-util';
import { error } from '../../../util/general-util';
import { useWindowSize } from '../../../hooks/window-size-hook';
import type { WindowSize } from '../../../hooks/window-size-hook';

type OwnProps = {|
  +date: SimpleDate;
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +doesShowCompletedTasks: boolean;
|};

type Props = {|
  ...OwnProps;
  +tasks: CompoundTask[];
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
    a + 1 + t.filtered.children.reduce(subtaskReducer, 0)
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
function FutureViewDay(
  {
    date, inNDaysView, taskEditorPosition, doesShowCompletedTasks, tasks,
  }: Props,
): Node {
  const [floatingViewOpened, setFloatingViewOpened] = React.useState(false);
  const [doesOverflow, setDoesOverflow] = React.useState(false);
  const windowSize = useWindowSize();
  const componentDivRef = React.useRef(null);

  const onOverflowChange = (newVal: boolean) => {
    if (!floatingViewOpened) { setDoesOverflow(newVal); }
  };

  const isToday = (() => {
    const today = getTodayAtZeroAM();
    return date.year === today.getFullYear()
      && date.month === today.getMonth()
      && date.date === today.getDate();
  })();

  const computeFloatingViewPosition = (): PositionStyle => {
    const componentDiv = componentDivRef.current ?? error('Impossible Case!');
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
    return computeFloatingViewStyle({
      tasks, inNDaysView, mainViewPosition, windowSize,
    });
  };

  const openFloatingView = () => setFloatingViewOpened(true);
  const closeFloatingView = () => setFloatingViewOpened(false);

  /**
   * Render the main content.
   *
   * @param {boolean} inMainList whether the header is in main list as opposed to floating list.
   * @return {*} the rendered content
   */
  const renderContent = (inMainList: boolean): Node => {
    const dateNumCssClass = inNDaysView
      ? styles.DateNumNDaysView
      : styles.DateNumOtherViews;
    const containerStyle = (inNDaysView && inMainList) ? { paddingTop: '1em' } : {};
    return (
      <React.Fragment>
        <div className={styles.DateInfo} style={containerStyle}>
          {inNDaysView && (
            <div className={styles.DateInfoDay}>
              {isToday ? 'TODAY' : day2String(date.day)}
            </div>
          )}
          <div className={dateNumCssClass}>{date.date}</div>
        </div>
        <FutureViewDayTaskContainer
          tasks={tasks}
          inNDaysView={inNDaysView}
          taskEditorPosition={taskEditorPosition}
          isInMainList={inMainList}
          onOverflowChange={onOverflowChange}
        />
      </React.Fragment>
    );
  };

  const Body = (): Node => {
    if (!doesOverflow) {
      return renderContent(true);
    }
    if (!floatingViewOpened) {
      return (
        <React.Fragment>
          {renderContent(true)}
          <button type="button" className={styles.MoreTasksBar} onClick={openFloatingView}>
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
          onClick={closeFloatingView}
        />
        <div className={styles.FloatingView} style={computeFloatingViewPosition()}>
          {renderContent(false)}
        </div>
      </React.Fragment>
    );
  };

  let wrapperCssClass: string;
  if (inNDaysView) {
    wrapperCssClass = isToday ? `${styles.NDaysView} ${styles.Today}` : styles.NDaysView;
  } else {
    wrapperCssClass = styles.OtherViews;
  }
  return (
    <div className={wrapperCssClass} ref={componentDivRef}>
      <Body />
    </div>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  null, null,
)(FutureViewDay);
export default Connected;
