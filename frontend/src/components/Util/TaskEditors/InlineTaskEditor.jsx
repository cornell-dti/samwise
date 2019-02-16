// @flow strict

import React from 'react';
import type { Node } from 'react';
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

type OwnProps = {|
  +task: Task; // the initial task given to the editor.
  className?: string; // additional class names applied to the editor.
|};

type DefaultProps = {|
  className?: string; // additional class names applied to the editor.
|};

type Props = {| ...OwnProps;...DefaultProps; |};

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({ task, className }: Props): Node {
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
    editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, onSave: boolean) => {
      editSubTask(subtaskId, partialSubTask);
      if (onSave) {
        onBlur();
      }
    },
    addSubTask: (subTask: SubTask) => { addSubTask(id, subTask); },
    removeTask: () => { removeTask(task); },
    removeSubTask: (subtaskId: string) => { removeSubTask(subtaskId); },
    onSave: onBlur,
    className,
    newSubTaskDisabled: disabled || !task.inFocus,
    onFocus,
    onBlur,
  };

  return <TaskEditor {...taskEditorProps} />;
}

InlineTaskEditor.defaultProps = { className: undefined };
