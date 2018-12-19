// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewDay.css';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';
import { countTasks } from './future-view-util';
import {
  floatingViewWidth,
  fourDaysViewHeaderHeight, otherViewsHeightHeader,
  taskContainerHeightFourDaysView, taskContainerHeightOtherViews, taskHeight,
} from './future-view-css-props';
import { day2String } from '../../../util/datetime-util';

type Props = {|
  +date: Date;
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
|};

type State = {|
  +floatingViewPosition: ?PositionStyle;
|};

type PropsForPositionComputation = {|
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +mainViewPosition: {| +width: number; +height: number; +top: number; +left: number; |};
|};
export opaque type PositionStyle : Object = {|
  +width: string;
  +height: string;
  +top: string;
  +left: string;
|};

/**
 * Returns the computed floating view style from some properties.
 *
 * @return the computed style.
 */
const computeFloatingViewStyle = (props: PropsForPositionComputation): PositionStyle => {
  const {
    tasks, inFourDaysView, doesShowCompletedTasks,
    mainViewPosition: {
      width, height, top, left,
    },
  } = props;
  // Compute the height of inner content
  const headerHeight = inFourDaysView ? fourDaysViewHeaderHeight : otherViewsHeightHeader;
  const tasksHeight = taskHeight * countTasks(tasks, inFourDaysView, doesShowCompletedTasks);
  const totalHeight = headerHeight + tasksHeight;
  // Decide the maximum allowed height and the actual height
  const maxAllowedHeight = inFourDaysView ? 400 : 300;
  const floatingViewHeight = Math.min(totalHeight, maxAllowedHeight);
  // Compute ideal offset
  let topOffset = (height - floatingViewHeight) / 2;
  let leftOffset = (width - floatingViewWidth) / 2;
  // Correct the offsets if they overflow.
  {
    if (!document.body) {
      throw new Error('What? No body?!');
    }
    const { offsetWidth, offsetHeight } = document.body;
    const topAbsolutePosition = top + topOffset;
    if (topAbsolutePosition < 0) {
      topOffset -= topAbsolutePosition;
    } else {
      const bottomAbsolutePosition = topAbsolutePosition + floatingViewHeight;
      const diff = bottomAbsolutePosition - offsetHeight;
      if (diff > 0) {
        topOffset -= diff;
      }
    }
    const leftAbsolutePosition = left + leftOffset;
    if (leftAbsolutePosition < 0) {
      leftOffset -= leftAbsolutePosition;
    } else {
      const rightAbsolutePosition = leftAbsolutePosition + floatingViewWidth;
      const diff = rightAbsolutePosition - offsetWidth;
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
export default class FutureViewDay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { floatingViewPosition: null };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateFloatingViewPosition);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateFloatingViewPosition);
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
   * Compute the floating view position.
   *
   * @return {PositionStyle} the floating view position.
   */
  computeFloatingViewPosition = (): PositionStyle => {
    const componentDiv = this.backlogDayElement;
    if (componentDiv == null) {
      throw new Error('Impossible Case!');
    }
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
    const { tasks, inFourDaysView, doesShowCompletedTasks } = this.props;
    return computeFloatingViewStyle({
      tasks, inFourDaysView, doesShowCompletedTasks, mainViewPosition,
    });
  };

  /**
   * Update floating view position, if it's opened.
   */
  updateFloatingViewPosition = () => this.setState((state: State) => {
    const { floatingViewPosition } = state;
    if (floatingViewPosition == null) {
      return state;
    }
    return { floatingViewPosition: this.computeFloatingViewPosition() };
  });

  /**
   * Open the floating view.
   */
  openFloatingView = () => this.setState({
    floatingViewPosition: this.computeFloatingViewPosition(),
  });

  /**
   * Close the floating view.
   */
  closeFloatingView = () => this.setState({ floatingViewPosition: null });

  /**
   * Render the main content.
   *
   * @param {boolean} inMainList whether the header is in main list as opposed to floating list.
   * @return {*} the rendered header component.
   */
  renderContent = (inMainList: boolean): Node => {
    const {
      date, tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
    } = this.props;
    const isToday = this.isToday();
    const dateNumCssClass = inFourDaysView
      ? styles.DateNumFourDaysView
      : styles.DateNumOtherViews;
    const containerStyle = (inFourDaysView && inMainList) ? { paddingTop: '1em' } : {};
    return (
      <React.Fragment>
        <div className={styles.DateInfo} style={containerStyle}>
          {inFourDaysView && (
            <div className={styles.DateInfoDay}>
              {isToday ? 'TODAY' : day2String(date.getDay())}
            </div>
          )}
          <div className={dateNumCssClass}>{date.getDate()}</div>
        </div>
        <FutureViewDayTaskContainer
          tasks={tasks}
          inFourDaysView={inFourDaysView}
          doesShowCompletedTasks={doesShowCompletedTasks}
          taskEditorPosition={taskEditorPosition}
          hideOverflow={inMainList}
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
    const { floatingViewPosition } = this.state;
    if (floatingViewPosition == null) {
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
        <div className={styles.FloatingView} style={floatingViewPosition}>
          {this.renderContent(false)}
        </div>
      </React.Fragment>
    );
  };

  backlogDayElement: ?HTMLDivElement;

  render(): Node {
    const { inFourDaysView } = this.props;
    let wrapperCssClass: string;
    if (inFourDaysView) {
      wrapperCssClass = this.isToday() ? `${styles.FourDaysView} ${styles.Today}` : styles.FourDaysView;
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
