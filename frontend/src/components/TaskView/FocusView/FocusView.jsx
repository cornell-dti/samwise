// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { Task } from '../../../store/store-types';
import styles from './FocusView.css';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';

/**
 * The focus view component.
 *
 * @param {Task[]} tasks the main task array.
 * @return {Node} the rendered focus view component.
 * @constructor
 */
export default function FocusView({ tasks }: {| tasks: Task[] |}): Node {
  const filterMapper = (task: Task): (Task | null) => {
    if (task.inFocus) {
      return task;
    }
    const subtaskArray = task.subtaskArray.filter(subTask => subTask.inFocus);
    return subtaskArray.length === 0 ? null : { ...task, subtaskArray };
  };
  const listItems = tasks
    .map(filterMapper)
    .map((task: Task | null): Node => task && (
      <InlineTaskEditor key={task.id} className={styles.TaskBox} task={task} />
    ));
  return (<div className={styles.FocusView}>{listItems}</div>);
}
