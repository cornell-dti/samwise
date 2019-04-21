import React, { ReactElement } from 'react';
import styles from './CompletedSeparator.module.scss';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly count: number;
  readonly doesShowCompletedTasks: boolean;
  readonly onDoesShowCompletedTasksChange: () => void;
};

const getIconClassName = (notInverted: boolean): string => (
  notInverted ? styles.Icon : `${styles.Icon} ${styles.Inverted}`
);

export default (
  { count, doesShowCompletedTasks, onDoesShowCompletedTasksChange }: Props,
): ReactElement => (
  <div className={styles.Separator}>
    <span className={styles.Text}>{`Completed: (${count})`}</span>
    <SamwiseIcon
      iconName="dropdown"
      className={getIconClassName(doesShowCompletedTasks)}
      onClick={onDoesShowCompletedTasksChange}
    />
    <div className={styles.Line} />
  </div>
);
