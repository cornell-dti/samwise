import React, { ReactNode, ReactElement } from 'react';

import { Task } from 'common/types/store-types';
import styles from './GroupViewMiddleBarTaskQueue.module.scss';
import GroupTask from '../RightView/GroupTask';

type Props = {
  readonly tasks: readonly Task[];
};

const EmptyTaskQueue = (): React.ReactElement => (
  <div className={styles.EmptyTaskQueue}>
    <p>Start adding new tasks!</p>
    <button type="button">Add task</button>
  </div>
);
function renderTaskList(tasks: readonly Task[]): ReactNode {
  return tasks.map((task) => <GroupTask key={task.id} original={task} memberName="" />);
}
const TaskQueue = ({ tasks }: Props): React.ReactElement => (
  <div>
    {tasks.length > 0 ? (
      <div className={styles.Container}>
        <h2>Task Queue</h2>
        {renderTaskList(tasks)}
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
