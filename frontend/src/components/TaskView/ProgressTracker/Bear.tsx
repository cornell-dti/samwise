import React, { ReactElement, CSSProperties } from 'react';
import { TasksProgressProps } from '../../../util/task-util';
import HappyBear from '../../../assets/bear/happy-bear.png';
import RegularBear from '../../../assets/bear/regular-bear.png';
import styles from './Bear.css';

type Props = TasksProgressProps & { readonly inNDaysView: boolean };

/**
 * The bear as a progress checker.
 */
export default ({ completedTasksCount, allTasksCount, inNDaysView }: Props): ReactElement => {
  const allCompleted = completedTasksCount === allTasksCount;
  let style: CSSProperties = { backgroundImage: `url(${allCompleted ? HappyBear : RegularBear})` };
  if (!inNDaysView) {
    style = { ...style, margin: '0' };
  }
  return <div className={styles.Bear} style={style} />;
};
