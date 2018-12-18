// @flow strict

import React from 'react';
import type { Node } from 'react';
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
|};
type ActionProps = {|
  +editMainTask: (taskId: number, partialMainTask: PartialMainTask) => EditMainTaskAction;
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +addSubTask: (taskId: number, subTask: SubTask) => AddNewSubTaskAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
  +removeSubTask: (taskId: number, subtaskId: number) => RemoveSubTaskAction;
|};
type DefaultProps = {|
  +className?: string; // additional class names applied to the editor.
|};
type Props = {|
  ...OwnProps;
  ...ActionProps;
  ...DefaultProps;
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
  static defaultProps: DefaultProps = {
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
    const taskEditorProps = {
      ...task,
      editMainTask: (partialMainTask: PartialMainTask) => { editMainTask(id, partialMainTask); },
      editSubTask: (subtaskId: number, partialSubTask: PartialSubTask) => {
        editSubTask(id, subtaskId, partialSubTask);
      },
      addSubTask: (subTask: SubTask) => { addSubTask(id, subTask); },
      removeTask: () => { removeTask(id, true); },
      removeSubTask: (subtaskId: number) => { removeSubTask(id, subtaskId); },
      className,
      disabled,
      onFocus: () => this.setState({ disabled: false }),
      onBlur: () => this.setState({ disabled: true }),
    };
    return <TaskEditor {...taskEditorProps} />;
  }
}

const ConnectedInlineTaskEditor = connect(
  null,
  {
    editMainTask: editMainTaskAction,
    editSubTask: editSubTaskAction,
    addSubTask: addSubTaskAction,
    removeTask: removeTaskAction,
    removeSubTask: removeSubTaskAction,
  },
)(InlineTaskEditor);
export default ConnectedInlineTaskEditor;
