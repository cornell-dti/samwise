import { State, Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import styles from './CompletedTasks.module.scss';
import SamwiseIcon from '../../../UI/SamwiseIcon';

type Props = {
  readonly original: Task;
  readonly completedTaskCount: number;
  readonly overflow: boolean;
};

function CompletedTask({ original, completedTaskCount, overflow }: Props): ReactElement {
  const backgroundColor = useSelector(({ tags }: State) => {
    if (original.metadata.type !== 'GROUP') return undefined;
    return Array.from(tags.values()).find(({ classId }) => {
      if (classId == null) return false;
      // classId has the format `<id from roster> <subject> <number>`, we take the later two parts.
      return classId.substring(classId.indexOf(' ') + 1) === original.tag;
    })?.color;
  });

  const month =
    original.metadata.date instanceof Date ? original.metadata.date.getMonth() + 1 : null;
  const day = original.metadata.date instanceof Date ? original.metadata.date.getDate() : null;
  const numericDate = `${month}/${day}`;

  const taskBar = (): ReactElement => (
    <li className={styles.CompletedTask} style={{ backgroundColor }}>
      <SamwiseIcon iconName="grabber" className={styles.GrabberIcon} />
      <span className={styles.CompletedTaskName}>{original.name}</span>
      <span className={styles.CompletedTaskDate}>{numericDate}</span>
    </li>
  );

  const additionalTaskBar = (): ReactElement => (
    <li className={styles.AdditionalCompletedTask} style={{ backgroundColor }}>
      {`+${completedTaskCount - 2} completed tasks`}
    </li>
  );

  return overflow ? additionalTaskBar() : taskBar();
}

export default CompletedTask;
