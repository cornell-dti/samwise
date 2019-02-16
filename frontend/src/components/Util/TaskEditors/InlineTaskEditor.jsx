// @flow strict

import React from 'react';
import type { ComponentType, Config, Node } from 'react';
import { connect } from 'react-redux';
import type {
  PartialMainTask, PartialSubTask, SubTask, Task,
} from '../../../store/store-types';
import type {
  EditMainTaskAction,
  EditSubTaskAction,
  AddNewSubTaskAction,
  RemoveSubTaskAction,
  RemoveTaskAction,
} from '../../../store/action-types';
import {
  editMainTask as editMainTaskAction,
  editSubTask as editSubTaskAction,
  addSubTask as addSubTaskAction,
  removeTask as removeTaskAction,
  removeSubTask as removeSubTaskAction,
} from '../../../store/actions';
import TaskEditor from './TaskEditor';

type OwnProps = {|
  +task: Task; // the initial task given to the editor.
  className?: string; // additional class names applied to the editor.
|};

type DefaultProps = {|
  className?: string; // additional class names applied to the editor.
|};

type Props = {|
  ...OwnProps;
  ...DefaultProps;
  // subscribed actions.
  +editMainTask: (taskId: number, partialMainTask: PartialMainTask) => EditMainTaskAction;
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +addSubTask: (taskId: number, subTask: SubTask) => AddNewSubTaskAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
  +removeSubTask: (taskId: number, subtaskId: number) => RemoveSubTaskAction;
|};

/**
 * The task editor used to edit task inline, activated on focus.
 */
function InlineTaskEditor(
  {
    task, className,
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask,
  }: Props,
): Node {
  const [disabled, setDisabled] = React.useState(true);

  const { id } = task;
  // To un-mount the editor when finished editing.
  const onFocus = () => setDisabled(false);
  const onBlur = () => setDisabled(true);
  const taskEditorProps = {
    ...task,
    editMainTask: (partialMainTask: PartialMainTask, onSave: boolean) => {
      editMainTask(id, partialMainTask);
      if (onSave) {
        onBlur();
      }
    },
    editSubTask: (subtaskId: number, partialSubTask: PartialSubTask, onSave: boolean) => {
      editSubTask(id, subtaskId, partialSubTask);
      if (onSave) {
        onBlur();
      }
    },
    addSubTask: (subTask: SubTask) => { addSubTask(id, subTask); },
    removeTask: () => { removeTask(id); },
    removeSubTask: (subtaskId: number) => { removeSubTask(id, subtaskId); },
    onSave: onBlur,
    className,
    allowEditTemporarySubTasks: false,
    newSubTaskDisabled: disabled || !task.inFocus,
    onFocus,
    onBlur,
  };

  return <TaskEditor {...taskEditorProps} />;
}

InlineTaskEditor.defaultProps = { className: undefined };

const actionCreators = {
  editMainTask: editMainTaskAction,
  editSubTask: editSubTaskAction,
  addSubTask: addSubTaskAction,
  removeTask: removeTaskAction,
  removeSubTask: removeSubTaskAction,
};

const Connected: ComponentType<Config<OwnProps, DefaultProps>> = connect(
  null, actionCreators,
)(InlineTaskEditor);
export default Connected;
