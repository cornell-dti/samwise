// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import type { TasksProgress } from '../../util/task-util';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './ProgressTracker.css';

type OwnProps = {| +progress: TasksProgress; |};
type Props = {| +windowSize: WindowSize; +progress: TasksProgress; |};

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 *
 * @param {WindowSize} windowSize the current window size.
 * @param {TasksProgress} progress the current progress.
 * @constructor
 */
function ProgressTracker({ windowSize, progress }: Props): Node {
  // Note: windowSize is unused for now, but it may be used later to distinguish
  // desktop and mobile view.
  return (
    <div className={styles.ProgressTracker}>
      <Bear progress={progress} />
      <ProgressIndicator progress={progress} />
    </div>
  );
}

const Connected: ComponentType<OwnProps> = windowSizeConnect(ProgressTracker);
export default Connected;
