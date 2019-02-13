// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './FutureViewTask.css';
import {
  editSubTask as editSubTaskAction,
  removeSubTask as removeSubTaskAction,
} from '../../../store/actions';
import type { PartialSubTask, SubTask } from '../../../store/store-types';
import type { EditSubTaskAction, RemoveSubTaskAction } from '../../../store/action-types';
import CheckBox from '../../UI/CheckBox';
import { dispatchConnect } from '../../../store/react-redux-util';

type Props = {|
  ...SubTask;
  +mainTaskId: number;
  +mainTaskCompleted: boolean;
  // subscribed from dispatchers.
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
function FutureViewSubTask(props: Props): Node {
  const {
    name, id, mainTaskId, complete, inFocus,
    mainTaskCompleted, editSubTask, removeSubTask,
  } = props;
  const canBeEdited = mainTaskId >= 0 && id >= 0;
  const onCompleteChange = () => {
    if (canBeEdited) {
      editSubTask(mainTaskId, id, { complete: !complete });
    }
  };
  const onFocusChange = () => {
    if (canBeEdited) {
      editSubTask(mainTaskId, id, { inFocus: !inFocus });
    }
  };
  const onRemove = () => {
    if (canBeEdited) {
      removeSubTask(mainTaskId, id);
    }
  };
  return (
    <div className={styles.SubTask}>
      <CheckBox
        className={styles.TaskCheckBox}
        checked={mainTaskCompleted || complete}
        disabled={mainTaskCompleted}
        inverted
        onChange={onCompleteChange}
      />
      <span
        className={styles.TaskText}
        style={(mainTaskCompleted || complete) ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.TaskIcon}
        onClick={onFocusChange}
      />
      <Icon name="delete" className={styles.TaskIcon} onClick={onRemove} />
    </div>
  );
}

const actionsCreators = { editSubTask: editSubTaskAction, removeSubTask: removeSubTaskAction };
const Connected = dispatchConnect<Props, typeof actionsCreators>(
  actionsCreators,
)(FutureViewSubTask);
export default Connected;
