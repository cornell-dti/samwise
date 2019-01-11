// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { Task } from '../../../store/store-types';
import styles from './FocusView.css';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import { filterInFocusTasks } from '../../../util/task-util';

/**
 * The focus view component.
 *
 * @param {Task[]} tasks the main task array.
 * @return {Node} the rendered focus view component.
 * @constructor
 */
export default function FocusView({ tasks }: {| tasks: Task[] |}): Node {
  return (
    <div className={styles.FocusView}>
      {filterInFocusTasks(tasks).map((task: Task): Node => (
        <InlineTaskEditor key={task.id} className={styles.TaskBox} task={task} />
      ))}
    </div>
  );
}
