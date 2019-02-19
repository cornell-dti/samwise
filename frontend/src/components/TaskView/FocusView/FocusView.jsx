// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { Task } from '../../../store/store-types';
import styles from './FocusView.css';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';
import ClearFocus from './ClearFocus';

/**
 * The focus view component.
 *
 * @param {Task[]} tasks the main task array.
 * @return {Node} the rendered focus view component.
 * @constructor
 */
export default function FocusView({ tasks }: {| tasks: Task[] |}): Node {
  return (
    <div>
      <div className={styles.ControlBlock}>
        <h3 className={styles.Title}>Focus</h3>
        <span className={styles.Padding} />
        <ClearFocus />
      </div>
      <div className={styles.FocusView}>
        {tasks.map((task: Task): Node => (
          <InlineTaskEditor key={task.id} className={styles.TaskBox} task={task} />
        ))}
      </div>
    </div>
  );
}
