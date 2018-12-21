// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { TasksProgressProps } from '../../util/task-util';
import { tasksProgressConnect } from '../../util/task-util';

/**
 * The progress tracker component.
 *
 * @param progress progressed provided by the connector function.
 * @constructor
 */
function ProgressTracker({ progress }: TasksProgressProps): Node {
  console.log(progress);
  return null;
}

const Connected = tasksProgressConnect<TasksProgressProps>(ProgressTracker);
export default Connected;
