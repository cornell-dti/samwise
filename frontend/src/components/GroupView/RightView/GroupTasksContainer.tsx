import React, { ReactElement, ReactNode } from 'react';
import { Task } from 'common/types/store-types';
import { sortTask } from 'common/util/task-util';
import styles from './GroupTasksContainer.module.scss';
import GroupTask from './GroupTask';
import CompletedTasksContainer from './CompletedTasks/CompletedTasksContainer';

type Props = {
  readonly tasks: readonly Task[];
  readonly memberName: string;
};

type IdOrder = {
  readonly id: string;
  readonly order: number;
};

function renderTaskList(tasks: readonly Task[], memberName: string): ReactNode {
  return [...tasks]
    .sort(sortTask)
    .map((task) => <GroupTask key={task.id} original={task} memberName={memberName} />);
}

function GroupTasksContainer({ tasks, memberName }: Props): ReactElement {
  const completedTasks = tasks.filter((task) => task.complete);

  return (
    <div
      className={styles.GroupTasksContainer}
      style={completedTasks.length > 0 ? { padding: '12px 0 0 0' } : {}}
    >
      {completedTasks.length > 0 ? <CompletedTasksContainer tasks={completedTasks} /> : null}
      {renderTaskList(tasks, memberName)}
    </div>
  );
}

export default GroupTasksContainer;
