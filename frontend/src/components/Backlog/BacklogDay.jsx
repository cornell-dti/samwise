// @flow strict

import * as React from 'react';
import BacklogTask from './BacklogTask';
import type { ColoredTask, OneDayTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/floating-task-editor-types';
import styles from './BacklogDay.css';

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
export default class BacklogDay extends React.Component<Props, State> {
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

  internalTasksContainer: ?HTMLDivElement;

  render() {
    const {
      inFourDaysView, doesShowCompletedTasks, doesRenderSubTasks, taskEditorPosition,
      date, tasks,
    } = this.props;
    const { doesOverflow } = this.state;
    const isToday = (() => {
      const today = new Date();
      return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
    })();
    const dayString = (() => {
      if (!inFourDaysView) {
        return '';
      }
      if (isToday) {
        return 'TODAY';
      }
      switch (date.getDay()) {
        case 0:
          return 'SUN';
        case 1:
          return 'MON';
        case 2:
          return 'TUE';
        case 3:
          return 'WED';
        case 4:
          return 'THU';
        case 5:
          return 'FRI';
        case 6:
          return 'SAT';
        default:
          throw new Error('Impossible Case');
      }
    })();
    let wrapperCssClass: string;
    if (inFourDaysView) {
      wrapperCssClass = isToday
        ? `${styles.BacklogDayFourDaysView} ${styles.BacklogToday}`
        : styles.BacklogDayFourDaysView;
    } else {
      wrapperCssClass = styles.BacklogDayOtherView;
    }
    const dateNumCssClass = inFourDaysView
      ? styles.BacklogDayDateInfoDateNumFourDaysView
      : styles.BacklogDayDateInfoDateNumOtherViews;
    const tasksComponent = tasks
      .filter((t: ColoredTask) => (doesShowCompletedTasks || !t.complete))
      .map((t: ColoredTask) => (
        <BacklogTask
          key={t.id}
          doesShowCompletedTasks={doesShowCompletedTasks}
          doesRenderSubTasks={doesRenderSubTasks}
          taskEditorPosition={taskEditorPosition}
          {...t}
        />
      ));
    const overflowComponent = doesOverflow && (
      <div className={styles.BacklogDayMoreTasksBar}>More Tasks...</div>
    );
    return (
      <div className={wrapperCssClass}>
        <div
          className={styles.BacklogDayDateInfo}
          style={inFourDaysView ? { paddingTop: '1em' } : {}}
        >
          {
            inFourDaysView && <div className={styles.BacklogDayDateInfoDay}>{dayString}</div>
          }
          <div className={dateNumCssClass}>
            {date.getDate()}
          </div>
        </div>
        <div
          className={styles.BacklogDayTaskContainer}
          ref={(e) => { this.internalTasksContainer = e; }}
        >
          {tasksComponent}
        </div>
        {overflowComponent}
      </div>
    );
  }
}
