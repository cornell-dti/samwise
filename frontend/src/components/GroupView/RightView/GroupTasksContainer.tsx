import React, { ReactElement, ReactNode } from 'react';
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

function renderTaskList(list: Task[]): ReactNode {
  return list.map((item) => <GroupTask key={item.id} original={item} />);
}

function GroupTasksContainer({ tasks }: Props): ReactElement {
  return <div className={styles.GroupTasksContainer}>{renderTaskList(tasks)}</div>;
}

export default GroupTasksContainer;
