// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import styles from './BacklogDay.css';
import BacklogDayTaskContainer from './BacklogDayTaskContainer';
import { countTasks } from './backlog-util';
import {
  fourDaysViewHeaderHeight, otherViewsHeightHeader,
  taskContainerHeightFourDaysView, taskContainerHeightOtherViews,
  taskHeight,
} from './backlog-css-props';
import { day2String } from '../../util/datetime-util';

type Props = {|
  +date: Date;
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
|};

type State = {| +floatingFlowParentRect: DOMRect | null; |};

/**
 * The component that renders all tasks on a certain day.
 */
export default class BacklogDay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { floatingFlowParentRect: null };
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
  toggleFloatingView = (): void => this.setState((state: State) => {
    const { floatingFlowParentRect } = state;
    if (floatingFlowParentRect != null) {
      return { floatingFlowParentRect: null };
    }
    const componentDiv = this.backlogDayElement;
    if (componentDiv == null) {
      throw new Error('Impossible Case!');
    }
    const boundingRect = componentDiv.getBoundingClientRect();
    if (!(boundingRect instanceof DOMRect)) {
      throw new Error('Bad boundingRect!');
    }
    return { floatingFlowParentRect: boundingRect };
  });

  /**
   * Render the header component.
   *
   * @param {boolean} isToday whether the day is today.
   * @param {boolean} inMainList whether the header is in main list as opposed to floating list.
   * @return {*} the rendered header component.
   */
  renderHeader = (isToday: boolean, inMainList: boolean): Node => {
    const { date, inFourDaysView } = this.props;
    const dateNumCssClass = inFourDaysView
      ? styles.BacklogDayDateInfoDateNumFourDaysView
      : styles.BacklogDayDateInfoDateNumOtherViews;
    const containerStyle = (inFourDaysView && inMainList) ? { paddingTop: '1em' } : {};
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
    if (!this.doesOverFlow()) {
      return null;
    }
    const toggleButton = (
      <button
        type="button"
        className={styles.BacklogDayMoreTasksBar}
        onClick={this.toggleFloatingView}
      >
        More Tasks...
      </button>
    );
    const { floatingFlowParentRect } = this.state;
    if (floatingFlowParentRect == null) {
      return toggleButton;
    }
    const {
      tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
    } = this.props;
    const headerHeight = inFourDaysView ? fourDaysViewHeaderHeight : otherViewsHeightHeader;
    const tasksHeight = taskHeight * countTasks(tasks, inFourDaysView, doesShowCompletedTasks);
    const totalHeight = headerHeight + tasksHeight;
    const { width, height } = floatingFlowParentRect;
    const floatingViewStyle = {
      left: `${(width - 300) / 2}px`,
      top: `${(Math.max(height, 400) - totalHeight) / 2}px`,
      height: `${totalHeight}px`,
    };
    return (
      <React.Fragment>
        {toggleButton}
        <div
          className={styles.BacklogDayFloatingViewBackgroundBlocker}
          role="button"
          tabIndex={-1}
          onClick={this.toggleFloatingView}
          onKeyDown={this.toggleFloatingView}
        />
        <div className={styles.BacklogDayFloatingView} style={floatingViewStyle}>
          {this.renderHeader(this.isToday(), false)}
          <BacklogDayTaskContainer
            tasks={tasks}
            inFourDaysView={inFourDaysView}
            doesShowCompletedTasks={doesShowCompletedTasks}
            taskEditorPosition={taskEditorPosition}
            hideOverflow={false}
          />
        </div>
      </React.Fragment>
    );
  };

  backlogDayElement: ?HTMLDivElement;

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
      <div className={wrapperCssClass} ref={(e) => { this.backlogDayElement = e; }}>
        {this.renderHeader(isToday, true)}
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
