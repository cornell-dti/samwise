import React from 'react';
import styles from './GroupViewMiddleBarTaskQueue.module.scss';

const EmptyTaskQueue = (): React.ReactElement => (
  <div className={styles.EmptyTaskQueue}>
    <p>Start adding new tasks!</p>
    <button type="button">Add task</button>
  </div>
);

const TaskQueue = (): React.ReactElement => (
  <div className={styles.TaskQueue}>
    <h2>Task Queue</h2>
    <div className={styles.TaskList}>
      <EmptyTaskQueue />
    </div>
  </div>
);

export default TaskQueue;
