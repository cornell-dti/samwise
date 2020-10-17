import React, { ReactElement, ReactNode } from 'react';
import { Task } from 'common/types/store-types';
import styles from './CompletedTasks.module.scss';
import CompletedTask from './CompletedTask';

type Props = {
  readonly tasks: readonly Task[];
};

function renderTaskList(list: readonly Task[]): ReactNode {
  // list of completed tasks
  const completedTasks = list.filter(task => task.complete);
  // if we have 3 or fewer completed tasks, render all of them
  if (completedTasks.length <= 3) {
    const taskBars = completedTasks.slice(0, completedTasks.length).map((task) =>
      <CompletedTask
        original={task}
        completedTaskCount={completedTasks.length}
        overflow={false}
      />);
    return (taskBars);
  }
  // if we have more than 3 completed tasks, the last bar should display
  // how many more tasks are complete
  const taskBars = completedTasks.slice(0, 2).map((task) =>
    <CompletedTask
      original={task}
      completedTaskCount={completedTasks.length}
      overflow={false}
    />);
  const bottomTaskBar =
    <CompletedTask
      original={completedTasks[2]}
      completedTaskCount={completedTasks.length}
      overflow={completedTasks.length > 3}
    />;
  taskBars.push(bottomTaskBar);
  return (taskBars);
}

function CompletedTasksContainer({ tasks }: Props): ReactElement {
  return (
    <div className={styles.CompletedTasksContainer}>
      {renderTaskList(tasks)}
    </div>
  );
}

export default CompletedTasksContainer;
