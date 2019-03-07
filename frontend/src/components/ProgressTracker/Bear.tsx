import React, { ReactElement } from 'react';
import { TasksProgressProps } from '../../util/task-util';
import HappyBear from '../../assets/bear/happy-bear.png';
import RegularBear from '../../assets/bear/regular-bear.png';
import styles from './Bear.css';

/**
 * The bear as a progress checker.
 */
export default ({ completedTasksCount, allTasksCount }: TasksProgressProps): ReactElement => {
  const allCompleted = completedTasksCount === allTasksCount;
  const style = { backgroundImage: `url(${allCompleted ? HappyBear : RegularBear})` };
  return <div className={styles.Bear} style={style} />;
};
