import React, { ReactElement, useState, ReactNode } from 'react';
import { Task } from 'common/types/store-types';
import styles from './GroupTasksContainer.module.scss';
import GroupTask from './GroupTask';

type Props = {
  readonly tasks: Task[];
};

type IdOrder = {
  readonly id: string;
  readonly order: number;
};

function renderTaskList(list: IdOrder[], filterCompleted: boolean): ReactNode {
  return list.map(({ id }, index) => (
    <GroupTask key={id} id={id} order={index} filterCompleted={filterCompleted} />
  ));
}

function GroupTasksContainer({ tasks }: Props): ReactElement {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  if (localTasks !== tasks) {
    setLocalTasks(tasks);
  }
  const localCompletedList: IdOrder[] = [];
  const localUncompletedList: IdOrder[] = [];
  localTasks.forEach(({ id, order, complete }: Task) => {
    const idOrder = { id, order };
    if (complete) {
      localCompletedList.push(idOrder);
    } else {
      localUncompletedList.push(idOrder);
    }
  });

  return (
    <div className={styles.GroupTasksContainer}>{renderTaskList(localUncompletedList, false)}</div>
  );
}

export default GroupTasksContainer;
