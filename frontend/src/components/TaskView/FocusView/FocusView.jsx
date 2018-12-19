// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { State, Task } from '../../../store/store-types';
import { simpleConnect } from '../../../store/react-redux-util';
import styles from './FocusView.css';
import InlineTaskEditor from '../../Util/TaskEditors/InlineTaskEditor';

type Props = {| mainTaskArray: Task[] |};

/**
 * The focus view component.
 *
 * @param {Task[]} mainTaskArray the main task array from redux store.
 * @return {Node} the rendered focus view component.
 * @constructor
 */
function FocusView({ mainTaskArray }: Props): Node {
  const filterMapper: (Task) => (Task | null) = (task) => {
    if (task.inFocus) {
      return task;
    }
    const subtaskArray = task.subtaskArray.filter(subTask => subTask.inFocus);
    return subtaskArray.length === 0 ? null : { ...task, subtaskArray };
  };
  const listItems = mainTaskArray
    .map(filterMapper)
    .map((task: Task | null) => task && (
      <InlineTaskEditor key={task.id} className={styles.TaskBox} task={task} />
    ));
  return (<div>{listItems}</div>);
}

const ConnectedFocusView = simpleConnect<{}, Props>(
  ({ mainTaskArray }: State): Props => ({ mainTaskArray }),
)(FocusView);
export default ConnectedFocusView;
