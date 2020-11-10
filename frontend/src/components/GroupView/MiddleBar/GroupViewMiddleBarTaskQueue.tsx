import React, { ReactNode, ReactElement } from 'react';

import { Task } from 'common/types/store-types';
import styles from './GroupViewMiddleBarTaskQueue.module.scss';
import GroupTask from '../RightView/GroupTask';
import { applyMiddleware } from 'redux';

type Props = {
  readonly tasks: Task[];
};

const EmptyTaskQueue = (): React.ReactElement => (
  <div className={styles.EmptyTaskQueue}>
    <p>Start adding new tasks!</p>
    <button type="button">Add task</button>
  </div>
);

function renderTaskList(tasks: Task[]): ReactNode {
  [...tasks].sort((a, b) => {
    return a.order - b.order;
  });

  return tasks.map((task) => {
    return <GroupTask key={task.id} original={task} memberName="" />;
  });
}
const TaskQueue = ({ tasks }: Props): React.ReactElement => (
  <div>
    {tasks.length > 0 ? (
      <div className={styles.TastQueue}>
        <h2>Task Queue</h2>
        <div className={styles.TaskList}>{renderTaskList(tasks)}</div>
      </div>
    ) : (
      <div className={styles.TaskQueue}>
        <h2>Task Queue</h2>
        <EmptyTaskQueue />
      </div>
    )}
  </div>
);

export default TaskQueue;
