// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { OneDayTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import styles from './BacklogDay.css';
import BacklogDayTaskContainer from './BacklogDayTaskContainer';
import { day2String } from './backlog-util';

type Props = {|
  ...OneDayTask;
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
|};
type State = {| doesOverflow: boolean; |}

/**
 * The component that renders all tasks on a certain day.
 */
export default class BacklogDay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { doesOverflow: false };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const container = this.internalTasksContainer;
    if (container == null) {
      return;
    }
    const doesOverflow = container.offsetHeight < container.scrollHeight;
    if (doesOverflow !== prevState.doesOverflow) {
      // I have to disable this lint because I don't know any other way to solve it.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ doesOverflow });
    }
  }

  /**
   * Report whether the day is today.
   *
   * @return {boolean} whether the day is today.
   */
  isToday = () => {
    const { date } = this.props;
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  };

  internalTasksContainer: ?HTMLDivElement;

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

  render(): Node {
    const {
      tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
    } = this.props;
    const { doesOverflow } = this.state;
    const isToday = this.isToday();
    let wrapperCssClass: string;
    if (inFourDaysView) {
      wrapperCssClass = isToday
        ? `${styles.BacklogDayFourDaysView} ${styles.BacklogToday}`
        : styles.BacklogDayFourDaysView;
    } else {
      wrapperCssClass = styles.BacklogDayOtherView;
    }
    const overflowComponent = doesOverflow && (
      <div className={styles.BacklogDayMoreTasksBar}>More Tasks...</div>
    );
    return (
      <div className={wrapperCssClass}>
        {this.renderHeader(isToday)}
        <BacklogDayTaskContainer
          tasks={tasks}
          inFourDaysView={inFourDaysView}
          doesShowCompletedTasks={doesShowCompletedTasks}
          taskEditorPosition={taskEditorPosition}
          refFunction={(e) => { this.internalTasksContainer = e; }}
        />
        {overflowComponent}
      </div>
    );
  }
}
