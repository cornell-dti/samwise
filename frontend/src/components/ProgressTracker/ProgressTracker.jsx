// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { TasksProgressProps } from '../../util/task-util';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './ProgressTracker.css';
import { getProgress } from '../../store/selectors';

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 */
function ProgressTracker({ completedTasksCount, allTasksCount }: TasksProgressProps): Node {
  // Note: windowSize is unused for now, but it may be used later to distinguish
  // desktop and mobile view.
  return (
    <div className={styles.ProgressTracker}>
      <Bear completedTasksCount={completedTasksCount} allTasksCount={allTasksCount} />
      <ProgressIndicator completedTasksCount={completedTasksCount} allTasksCount={allTasksCount} />
    </div>
  );
}

const Connected: ComponentType<{||}> = connect(getProgress)(ProgressTracker);
export default Connected;
