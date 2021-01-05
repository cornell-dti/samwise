import React, { ReactElement } from 'react';
import clsx from 'clsx';
import styles from './CompletedSeparator.module.scss';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly count: number;
  readonly doesShowCompletedTasks: boolean;
  readonly onDoesShowCompletedTasksChange: () => void;
};

const CompletedSeparator = ({
  count,
  doesShowCompletedTasks,
  onDoesShowCompletedTasksChange,
}: Props): ReactElement => (
  <div className={styles.Separator}>
    <span className={styles.Text}>{`Completed: (${count})`}</span>
    <SamwiseIcon
      iconName="dropdown"
      className={clsx(styles.Icon, !doesShowCompletedTasks && styles.Inverted)}
      onClick={onDoesShowCompletedTasksChange}
    />
    <div className={styles.Line} />
  </div>
);

export default CompletedSeparator;
