import React, { ReactElement, ReactNode } from 'react';
import { Task } from 'common/types/store-types';
import styles from './GroupTasksContainer.module.scss';
import GroupTask from './GroupTask';

type Props = {
  readonly tasks: readonly Task[];
  readonly memberName: string;
};

type IdOrder = {
  readonly id: string;
  readonly order: number;
};

function renderTaskList(list: readonly Task[], memberName: string): ReactNode {
  return list.map((item) => <GroupTask key={item.id} original={item} memberName={memberName} />);
}

function GroupTasksContainer({ tasks, memberName }: Props): ReactElement {
  return <div className={styles.GroupTasksContainer}>{renderTaskList(tasks, memberName)}</div>;
}

export default GroupTasksContainer;
