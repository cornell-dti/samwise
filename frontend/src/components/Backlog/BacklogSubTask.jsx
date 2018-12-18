// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import {
  editSubTask as editSubTaskAction,
  removeSubTask as removeSubTaskAction,
} from '../../store/actions';
import type { PartialSubTask, SubTask } from '../../store/store-types';
import type { EditSubTaskAction, RemoveSubTaskAction } from '../../store/action-types';
import CheckBox from '../UI/CheckBox';

type Props = {|
  ...SubTask;
  +mainTaskId: number;
  +mainTaskCompleted: boolean;
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +removeSubTask: (taskId: number, subTaskId: number) => RemoveSubTaskAction;
|};

/**
 * The component used to render one subtask in backlog day.
 *
 * @param props the props to render.
 * @return {Node} the rendered element.
 * @constructor
 */
function BacklogSubTask(props: Props): Node {
  const {
    name, id, mainTaskId, complete, inFocus,
    mainTaskCompleted, editSubTask, removeSubTask,
  } = props;
  const checkboxPositionElement = mainTaskCompleted
    ? (<span className={styles.BacklogTaskCheckBoxPlaceHolder} />)
    : (
      <CheckBox
        className={styles.BacklogTaskCheckBox}
        checked={complete}
        inverted
        onChange={() => editSubTask(mainTaskId, id, { complete: !complete })}
      />
    );
  return (
    <div className={styles.BacklogSubTask}>
      {checkboxPositionElement}
      <span
        className={styles.BacklogTaskText}
        style={(mainTaskCompleted || complete) ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.BacklogTaskIcon}
        onClick={() => editSubTask(mainTaskId, id, { inFocus: !inFocus })}
      />
      <Icon
        name="delete"
        className={styles.BacklogTaskIcon}
        onClick={() => removeSubTask(mainTaskId, id)}
      />
    </div>
  );
}

const ConnectedBacklogSubTask = connect(
  null,
  { editSubTask: editSubTaskAction, removeSubTask: removeSubTaskAction },
)(BacklogSubTask);
export default ConnectedBacklogSubTask;
