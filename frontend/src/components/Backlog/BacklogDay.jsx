// @flow strict

import * as React from 'react';
import BacklogTask from './BacklogTask';
import styles from './BacklogDay.css';
import type { OneDayTask } from './backlog-types';

type State = {| doesOverflow: boolean; |}

/**
 * The component that renders all tasks on a certain day.
 */
export default class BacklogDay extends React.Component<OneDayTask, State> {
  constructor(props: OneDayTask) {
    super(props);
    this.state = { doesOverflow: false };
  }

  componentDidUpdate(prevProps: OneDayTask, prevState: State) {
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

  /**
   * Report whether there is a vertical overflow.
   */
  reportVerticalOverflow() {

  }

  render() {
    const { date, doesRenderSubTasks, tasks } = this.props;
    const { doesOverflow } = this.state;
    const dayString = (() => {
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
    return (
      <div className={styles.BacklogDay}>
        <div className={styles.BacklogDayDateInfo}>
          <div className={styles.BacklogDayDateInfoDay}>{dayString}</div>
          <div className={styles.BacklogDayDateInfoDateNum}>{date.getDate()}</div>
        </div>
        <div
          className={styles.BacklogDayTaskContainer}
          ref={(e) => {
            this.internalTasksContainer = e;
          }}
        >
          {
            tasks.map(t => (
              <BacklogTask key={t.id} doesRenderSubTasks={doesRenderSubTasks} {...t} />
            ))
          }
          {
            doesOverflow && (<div className={styles.BacklogDayMoreTasksBar}>More Tasks...</div>)
          }
        </div>
      </div>
    );
  }
}
