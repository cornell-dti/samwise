// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { TasksProgress } from '../../util/task-util';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import ProgressIndicator from './ProgressIndicator';
import styles from './ProgressTracker.css';

type Props = {|
  +windowSize: WindowSize;
  +progress: TasksProgress;
|};

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 *
 * @param {WindowSize} windowSize the current window size.
 * @param {TasksProgress} progress the current progress.
 * @constructor
 */
function ProgressTracker({ windowSize, progress }: Props): Node {
  return (
    <div className={styles.ProgressTracker}>
      <ProgressIndicator progress={progress} />
    </div>
  );
}

const Connected = windowSizeConnect<Props>(ProgressTracker);
export default Connected;
