import React, { ReactElement, ReactNode } from 'react';
import { Task } from 'common/types/store-types';
import styles from './GroupTasksContainer.module.scss';
import GroupTask from './GroupTask';
import CompletedTasksContainer from './CompletedTasks/CompletedTasksContainer';

type Props = {
  readonly tasks: readonly Task[];
};

type IdOrder = {
  readonly id: string;
  readonly order: number;
};

function renderTaskList(tasks: readonly Task[]): ReactNode {
  return tasks.map((task) => <GroupTask key={task.id} original={task} />);
}

function GroupTasksContainer({ tasks }: Props): ReactElement {
  const completedTasks = tasks.filter((task) => task.complete);

  return (
    <div
      className={styles.GroupTasksContainer}
      style={completedTasks.length > 0 ? { padding: '12px 0 0 0' } : {}}
    >
      {completedTasks.length > 0 ? <CompletedTasksContainer tasks={completedTasks} /> : null}
      {renderTaskList(tasks)}
    </div>
  );
}

export default GroupTasksContainer;
