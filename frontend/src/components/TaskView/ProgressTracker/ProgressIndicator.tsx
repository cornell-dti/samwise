import React, { ReactNode, ReactElement, CSSProperties } from 'react';
import { TasksProgressProps } from '../../../util/task-util';
import styles from './ProgressIndicator.css';

type ProgressBarProps = TasksProgressProps & {
  readonly inNDaysView: boolean;
  readonly children?: ReactNode;
};

/**
 * A simple progress bar with optional children.
 */
function ProgressBar(
  { completedTasksCount, allTasksCount, inNDaysView, children }: ProgressBarProps,
): ReactElement {
  const percentage = allTasksCount === 0 ? 0 : completedTasksCount / allTasksCount * 100;
  const containerStyle: CSSProperties = inNDaysView
    ? { height: '2em', marginLeft: '1em' }
    : { width: '2em', marginBottom: '1em' };
  const innerStyle: CSSProperties = inNDaysView
    ? { height: '2em', width: `${percentage}%` }
    : { width: '2em', height: `${percentage}%` };
  return (
    <div className={styles.ProgressBarContainer} style={containerStyle}>
      <div className={styles.ProgressBarIndicator} style={innerStyle} />
      {children}
    </div>
  );
}

ProgressBar.defaultProps = { children: null };

type Props = TasksProgressProps & { readonly inNDaysView: boolean };

/**
 * The progress indicator.
 */
export default function ProgressIndicator(
  { completedTasksCount, allTasksCount, inNDaysView }: Props,
): ReactElement {
  const containerStyle: CSSProperties = inNDaysView
    ? { flex: 'auto', height: '2em' }
    : { flexDirection: 'column-reverse', margin: '0', width: '2em', height: '100%' };
  const textStyle: CSSProperties = inNDaysView ? {} : { width: '70px', marginBottom: '8px' };
  const fractionString = `${completedTasksCount}/${allTasksCount}`;
  return (
    <div className={styles.ProgressIndicator} style={containerStyle}>
      <div className={styles.ProgressText} style={textStyle}>
        <div className={styles.ProgressCountText}>{fractionString}</div>
        <div className={styles.ProgressOtherText}>tasks complete</div>
      </div>
      <ProgressBar
        completedTasksCount={completedTasksCount}
        allTasksCount={allTasksCount}
        inNDaysView={inNDaysView}
      />
    </div>
  );
}
