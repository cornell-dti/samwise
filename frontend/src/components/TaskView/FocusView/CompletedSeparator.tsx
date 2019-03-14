import React, { ReactElement } from 'react';
import HideOrShowToggle from '../../../assets/svgs/v.svg';
import styles from './CompletedSeparator.module.css';

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
    <HideOrShowToggle
      className={getIconClassName(doesShowCompletedTasks)}
      onClick={onDoesShowCompletedTasksChange}
    />
    <div className={styles.Line} />
  </div>
);
