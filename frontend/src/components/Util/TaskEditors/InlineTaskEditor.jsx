// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type {
  PartialMainTask, PartialSubTask, SubTask, Task,
} from '../../../store/store-types';
import TaskEditor from './TaskEditor';
import {
  addSubTask,
  editMainTask,
  editSubTask,
  removeSubTask,
  removeTask,
} from '../../../firebase/actions';
import { error } from '../../../util/general-util';

type OwnProps = {|
  +taskId: string; // the initial task given to the editor.
  className?: string; // additional class names applied to the editor.
|};

type Props = {|
  ...OwnProps;
  task: Task;
  className?: string; // additional class names applied to the editor.
|};

/**
 * The task editor used to edit task inline, activated on focus.
 */
function InlineTaskEditor({ task, className }: Props): Node {
  const [disabled, setDisabled] = React.useState(() => {
    console.log('InlineTaskEditor recreated!');
    return true;
  });

  const { id } = task;
  // To un-mount the editor when finished editing.
  const onFocus = () => setDisabled(false);
  const onBlur = () => setDisabled(true);
  const actions = {
    editMainTask: (partialMainTask: PartialMainTask, onSave: boolean) => {
      editMainTask(id, partialMainTask);
      if (onSave) {
        onBlur();
      }
    },
    editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, onSave: boolean) => {
      editSubTask(subtaskId, partialSubTask);
      if (onSave) {
        onBlur();
      }
    },
    addSubTask: ({ id: _, ...subTaskWithoutID }: SubTask) => addSubTask(id, subTaskWithoutID),
    removeTask: () => removeTask(task),
    removeSubTask,
    onSave: onBlur,
  };
  const taskEditorProps = {
    task,
    actions,
    className,
    newSubTaskDisabled: disabled || !task.inFocus,
    onFocus,
    onBlur,
  };

  return <TaskEditor {...taskEditorProps} />;
}

InlineTaskEditor.defaultProps = { className: undefined };

// TODO filter subtasks that are not in focus

const Connected: ComponentType<OwnProps> = connect(
  ({ tasks }, { taskId }) => ({ task: tasks.get(taskId) ?? error('Corrupted!') }),
)(InlineTaskEditor);
export default Connected;
