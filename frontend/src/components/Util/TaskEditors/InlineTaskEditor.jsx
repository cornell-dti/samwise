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

type Props = {|
  className?: string; // additional class names applied to the editor.
  original: Task;
  filtered: Task;
|};

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({ original, filtered, className }: Props): Node {
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
