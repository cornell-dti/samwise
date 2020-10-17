import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import styles from './CompletedTasks.module.scss';
import SamwiseIcon from '../../../UI/SamwiseIcon';

type Props = {
  readonly original: Task;
  readonly completedTaskCount: number;
  readonly overflow: boolean;
};

function CompletedTask({ original, completedTaskCount, overflow }: Props): ReactElement {
  const month = original.metadata.date instanceof Date ? original.metadata.date.getMonth() + 1 : null;
  const day = original.metadata.date instanceof Date ? original.metadata.date.getDate() : null;
  const numericDate = `${month}/${day}`;

  const taskBar = (): ReactElement => (
    <li className={styles.CompletedTask}>
      <span>
        <SamwiseIcon iconName="grabber" className={styles.GrabberIcon} />
        <span className={styles.CompletedTaskName}>
          {original.name}
        </span>
      </span>
      <span className={styles.CompletedTaskDate}>{numericDate}</span>
    </li>
  );

  const additionalTaskBar = (): ReactElement => (
    <li className={styles.AdditionalCompletedTask}>
      {`+${completedTaskCount - 2} completed tasks`}
    </li>
  );

  return (
    overflow ? additionalTaskBar() : taskBar()
  );
}

export default CompletedTask;
