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
import type { TaskWithSubTasks } from './editors-types';

type Props = {|
  +original: Task;
  +filtered: TaskWithSubTasks;
  +className?: string; // additional class names applied to the editor.
|};

type TempSubTask =
  | {| +type: 'UNCOMMITTED', +subTask: SubTask |}
  | {| +type: 'COMMITTED', +subTask: SubTask; +prevTempId: string; |}
  | null;

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({ original, filtered, className }: Props): Node {
  const [disabled, setDisabled] = React.useState(true);
  const [tempSubTask, setTempSubTask] = React.useState<TempSubTask>(null);
  if (tempSubTask?.type === 'COMMITTED') {
    setTempSubTask(null);
  }

  const { id } = original;
  // To un-mount the editor when finished editing.
  const onFocus = () => setDisabled(false);
  const onBlur = () => {
    if (tempSubTask !== null && tempSubTask.type === 'UNCOMMITTED') {
      const { id: prevTempId, ...rest } = tempSubTask.subTask;
      const newSubTask = addSubTask(id, rest);
      setTempSubTask({ type: 'COMMITTED', subTask: newSubTask, prevTempId });
    }
    setDisabled(true);
  };
  const actions = {
    editMainTask: (partialMainTask: PartialMainTask) => {
      editMainTask(id, partialMainTask);
    },
    editSubTask: (subTaskId: string, partialSubTask: PartialSubTask) => {
      if (tempSubTask !== null) {
        if (tempSubTask.type === 'UNCOMMITTED') {
          if (tempSubTask.subTask.id === subTaskId) {
            const { id: prevTempId, ...rest } = tempSubTask.subTask;
            const newSubTask = addSubTask(id, { ...rest, ...partialSubTask });
            setTempSubTask({ type: 'COMMITTED', subTask: newSubTask, prevTempId });
            return;
          }
        } else if (tempSubTask.type === 'COMMITTED' && tempSubTask.prevTempId === subTaskId) {
          editSubTask(tempSubTask.subTask.id, partialSubTask);
          return;
        }
      }
      editSubTask(subTaskId, partialSubTask);
    },
    addSubTask: (subTask: SubTask) => {
      setTempSubTask({ type: 'UNCOMMITTED', subTask });
    },
    removeTask: () => removeTask(original),
    removeSubTask: (subTaskId) => {
      if (tempSubTask !== null) {
        if (tempSubTask.type === 'UNCOMMITTED' && subTaskId === tempSubTask.subTask.id) {
          setTempSubTask(null);
        } else if (tempSubTask.type === 'COMMITTED') {
          removeSubTask(id, tempSubTask.subTask.id);
        }
      } else {
        removeSubTask(id, subTaskId);
      }
    },
    onSave: onBlur,
  };
  const { id: _, subTasks, ...mainTask } = filtered;
  return (
    <TaskEditor
      className={className}
      mainTask={mainTask}
      subTasks={subTasks}
      tempSubTask={tempSubTask === null ? null : tempSubTask.subTask}
      actions={actions}
      newSubTaskAutoFocused={!original.inFocus}
      newSubTaskDisabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

InlineTaskEditor.defaultProps = { className: undefined };
