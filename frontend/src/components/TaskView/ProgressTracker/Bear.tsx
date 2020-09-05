import React, { ReactElement, CSSProperties } from 'react';
import { TasksProgressProps } from 'common/lib/util/task-util';
import styles from './Bear.module.css';
import { HappyBear, RegularBear } from '../../../assets/assets-constants';

type Props = TasksProgressProps & { readonly inMobileView: boolean };

/**
 * The bear as a progress checker.
 */
export default ({ completedTasksCount, allTasksCount, inMobileView }: Props): ReactElement => {
  const allCompleted = completedTasksCount === allTasksCount;
  let style: CSSProperties = { backgroundImage: `url(${allCompleted ? HappyBear : RegularBear})` };
  if (!inMobileView) {
    style = { ...style, margin: '0' };
  }
  return <div className={styles.Bear} style={style} />;
};
