// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import styles from './FutureViewTask.css';
import {
  editSubTask as editSubTaskAction,
  removeSubTask as removeSubTaskAction,
} from '../../../store/actions';
import type { PartialSubTask, SubTask } from '../../../store/store-types';
import type { EditSubTaskAction, RemoveSubTaskAction } from '../../../store/action-types';
import CheckBox from '../../UI/CheckBox';

type OwnProps = {|
  ...SubTask;
  +mainTaskId: number;
  +mainTaskCompleted: boolean;
|};

type DispatchProps = {|
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +removeSubTask: (taskId: number, subTaskId: number) => RemoveSubTaskAction;
|};

type Props = {| ...OwnProps; ...DispatchProps; |};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask(
  {
    name, id, mainTaskId, complete, inFocus,
    mainTaskCompleted, editSubTask, removeSubTask,
  }: Props,
): Node {
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

const actionCreators = { editSubTask: editSubTaskAction, removeSubTask: removeSubTaskAction };
const Connected: ComponentType<OwnProps> = connect(null, actionCreators)(FutureViewSubTask);
export default Connected;
