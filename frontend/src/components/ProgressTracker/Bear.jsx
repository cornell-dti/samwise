// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { TasksProgress } from '../../util/task-util';
import HappyBear from '../../assets/bear/happy-bear.png';
import RegularBear from '../../assets/bear/regular-bear.png';
import styles from './Bear.css';

type Props = {|
  +progress: TasksProgress;
|};

/**
 * The bear as a progress checker.
 *
 * @param {TasksProgress} progress current task progress
 * @constructor
 */
export default function Bear({ progress }: Props): Node {
  const { completed, all } = progress;
  const style = { backgroundImage: `url(${completed === all ? HappyBear : RegularBear})` };
  return (
    <div className={styles.Bear} style={style} />
  );
}
