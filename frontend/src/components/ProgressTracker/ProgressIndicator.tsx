import React, { ReactNode, ReactElement } from 'react';
import { TasksProgressProps } from '../../util/task-util';
import styles from './ProgressIndicator.css';

type ProgressBarProps = TasksProgressProps & { readonly children?: ReactNode };

/**
 * A simple progress bar with optional children.
 */
function ProgressBar(
  { completedTasksCount, allTasksCount, children }: ProgressBarProps,
): ReactElement {
  const percentage = allTasksCount === 0 ? 0 : completedTasksCount / allTasksCount * 100;
  const innerStyle = { width: `${percentage}%` };
  return (
    <div className={styles.ProgressBarContainer}>
      <div className={styles.ProgressBarIndicator} style={innerStyle} />
      {children}
    </div>
  );
}

ProgressBar.defaultProps = { children: null };

/**
 * The progress indicator.
 */
export default function ProgressIndicator(props: TasksProgressProps): ReactElement {
  const { completedTasksCount, allTasksCount } = props;
  const fractionString = `${completedTasksCount}/${allTasksCount}`;
  return (
    <div className={styles.ProgressIndicator}>
      <div className={styles.ProgressText}>
        <div className={styles.ProgressCountText}>{fractionString}</div>
        <div className={styles.ProgressOtherText}>tasks complete</div>
      </div>
      <ProgressBar completedTasksCount={completedTasksCount} allTasksCount={allTasksCount} />
    </div>
  );
}
