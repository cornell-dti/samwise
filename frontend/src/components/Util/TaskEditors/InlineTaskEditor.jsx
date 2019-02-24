// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type {
  PartialMainTask, PartialSubTask, State, SubTask, Task, TaskWithSubTasks,
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
import { getFilteredInFocusTask } from '../../../util/task-util';

type OwnProps = {|
  +taskId: string;
  +className?: string; // additional class names applied to the editor.
|};
type Props = {|
  ...OwnProps;
  +original: Task;
  +filtered: TaskWithSubTasks;
|};

/**
 * The task editor used to edit task inline, activated on focus.
 */
function InlineTaskEditor({ original, filtered, className }: Props): Node {
  const [disabled, setDisabled] = React.useState(() => {
    console.log('InlineTaskEditor recreated!');
    return true;
  });

  const { id } = original;
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
    removeTask: () => removeTask(original),
    removeSubTask,
    onSave: onBlur,
  };
  const taskEditorProps = {
    task: filtered,
    actions,
    className,
    newSubTaskDisabled: disabled || !original.inFocus,
    onFocus,
    onBlur,
  };

  return <TaskEditor {...taskEditorProps} />;
}

InlineTaskEditor.defaultProps = { className: undefined };

const Connected: ComponentType<OwnProps> = connect(
  ({ tasks, subTasks }: State, { taskId }: OwnProps) => {
    const original = tasks.get(taskId) ?? error();
    const filtered = getFilteredInFocusTask(original, subTasks);
    return { original, filtered };
  },
)(InlineTaskEditor);
export default Connected;
