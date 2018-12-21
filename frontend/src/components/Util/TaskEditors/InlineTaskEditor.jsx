// @flow strict

import React from 'react';
import type { Node } from 'react';
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
import { dispatchConnect } from '../../../store/react-redux-util';

type Props = {|
  +task: Task; // the initial task given to the editor.
  className?: string; // additional class names applied to the editor.
  // subscribed actions.
  +editMainTask: (taskId: number, partialMainTask: PartialMainTask) => EditMainTaskAction;
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +addSubTask: (taskId: number, subTask: SubTask) => AddNewSubTaskAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
  +removeSubTask: (taskId: number, subtaskId: number) => RemoveSubTaskAction;
|};

type State = {|
  +disabled: boolean; // whether editing is disabled
  +savedTask?: Task; // has a value only when there is some unsaved state.
  +intervalId?: IntervalID; // used for regular saving
|};

/**
 * The task editor used to edit task inline, activated on focus.
 */
class InlineTaskEditor extends React.Component<Props, State> {
  static defaultProps = {
    className: undefined,
  };

  state: State = { disabled: true };

  render(): Node {
    const {
      task, className,
      editMainTask, editSubTask, addSubTask, removeTask, removeSubTask,
    } = this.props;
    const { id } = task;
    const { disabled } = this.state;
    // To un-mount the editor when finished editing.
    const onFocus = () => this.setState({ disabled: false });
    const onBlur = () => this.setState({ disabled: true });
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
      removeTask: () => { removeTask(id, true); },
      removeSubTask: (subtaskId: number) => { removeSubTask(id, subtaskId); },
      onSave: onBlur,
      className,
      disabled,
      onFocus,
      onBlur,
    };
    return <TaskEditor {...taskEditorProps} />;
  }
}

const actionCreators = {
  editMainTask: editMainTaskAction,
  editSubTask: editSubTaskAction,
  addSubTask: addSubTaskAction,
  removeTask: removeTaskAction,
  removeSubTask: removeSubTaskAction,
};

const ConnectedInlineTaskEditor = dispatchConnect<Props, typeof actionCreators>(
  actionCreators,
)(InlineTaskEditor);
export default ConnectedInlineTaskEditor;
