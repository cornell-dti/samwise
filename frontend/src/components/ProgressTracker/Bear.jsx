// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { TasksProgressProps } from '../../util/task-util';
import HappyBear from '../../assets/bear/happy-bear.png';
import RegularBear from '../../assets/bear/regular-bear.png';
import styles from './Bear.module.css';

/**
 * The bear as a progress checker.
 */
export default function Bear({ completedTasksCount, allTasksCount }: TasksProgressProps): Node {
  const allCompleted = completedTasksCount === allTasksCount;
  const style = { backgroundImage: `url(${allCompleted ? HappyBear : RegularBear})` };
  return (
    <div className={styles.Bear} style={style} />
  );
}
