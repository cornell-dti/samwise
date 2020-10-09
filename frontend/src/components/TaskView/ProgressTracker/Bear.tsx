import React, { ReactElement, CSSProperties } from 'react';
import { TasksProgressProps } from 'common/util/task-util';
import styles from './Bear.module.scss';
import { HappyBear, RegularBear } from '../../../assets/assets-constants';

type Props = TasksProgressProps & { readonly inMobileView: boolean };

const Bear = ({ completedTasksCount, allTasksCount, inMobileView }: Props): ReactElement => {
  const allCompleted = completedTasksCount === allTasksCount;
  let style: CSSProperties = { backgroundImage: `url(${allCompleted ? HappyBear : RegularBear})` };
  if (!inMobileView) {
    style = { ...style, margin: '0' };
  }
  return <div className={styles.Bear} style={style} />;
};

/**
 * The bear as a progress checker.
 */
export default Bear;
