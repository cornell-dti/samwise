// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { TasksProgress, TasksProgressProps } from '../../util/task-util';
import styles from './ProgressIndicator.css';

type ProgressBarProps = {|
  +progress: TasksProgress;
  +children: Node;
|};

/**
 * A simple progress bar with optional children.
 *
 * @param {TasksProgress} progress the current progress.
 * @param {?Node} children an optional children.
 * @return {Node} the rendered progress bar.
 * @constructor
 */
function ProgressBar({ progress, children }: ProgressBarProps): Node {
  const { completed, all } = progress;
  const percentage = all === 0 ? 0 : completed / all * 100;
  const innerStyle = { width: `${percentage}%` };
  return (
    <div className={styles.ProgressBarContainer}>
      <div className={styles.ProgressBarIndicator} style={innerStyle} />
      {children}
    </div>
  );
}

// eslint-disable-next-line
ProgressBar.defaultProps = { children: null };

/**
 * The progress indicator.
 *
 * @param {WindowSize} windowSize the current window size.
 * @param {TasksProgress} progress the current progress.
 * @return {Node} the rendered progress bar.
 * @constructor
 */
export default function ProgressIndicator({ progress }: TasksProgressProps): Node {
  const { completed, all } = progress;
  return (
    <div className={styles.ProgressIndicator}>
      <div className={styles.ProgressText}>
        <div>{`${completed}/${all}`}</div>
        <div className={styles.ProgressOtherText}>tasks complete</div>
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
}
