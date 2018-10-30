/* eslint-disable import/order */
// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import { Checkbox, Icon } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import {
  markSubtask as markSubtaskAction,
  removeSubTask as removeSubTaskAction,
  toggleSubTaskPin as toggleSubTaskPinAction,
} from '../../store/actions';
import type { SubTask } from '../../store/store-types';
import { bindActionCreators } from 'redux';
import type {
  Dispatch,
  MarkSubTaskAction,
  RemoveSubTaskAction,
  ToggleSubTaskPinAction,
} from '../../store/action-types';

type Props = {|
  ...SubTask;
  +mainTaskId: number;
  +markSubtask: (taskId: number, subTaskId: number) => MarkSubTaskAction;
  +toggleSubTaskPin: (taskId: number, subTaskId: number) => ToggleSubTaskPinAction;
  +removeSubTask: (taskId: number, subTaskId: number) => RemoveSubTaskAction;
|};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  markSubtask: markSubtaskAction,
  toggleSubTaskPin: toggleSubTaskPinAction,
  removeSubTask: removeSubTaskAction,
}, dispatch);

/**
 * The component used to render one subtask in backlog day.
 *
 * @param props the props to render.
 * @return {*} the rendered element.
 * @constructor
 */
function BacklogSubTask(props: Props) {
  const {
    name, id, mainTaskId, complete, inFocus,
    markSubtask, toggleSubTaskPin, removeSubTask,
  } = props;
  return (
    <div className={styles.BacklogSubTask}>
      <Checkbox
        className={styles.BacklogTaskCheckBox}
        checked={complete}
        onChange={() => markSubtask(mainTaskId, id)}
      />
      <span
        className={styles.BacklogTaskText}
        style={complete ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <Icon
        name="delete"
        className={styles.BacklogTaskIcon}
        onClick={() => removeSubTask(mainTaskId, id)}
      />
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.BacklogTaskIcon}
        onClick={() => toggleSubTaskPin(mainTaskId, id)}
      />
    </div>
  );
}

const ConnectedBacklogSubTask = connect(null, mapDispatchToProps)(BacklogSubTask);
export default ConnectedBacklogSubTask;
