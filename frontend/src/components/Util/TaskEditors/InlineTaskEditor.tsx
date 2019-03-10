import React, { ReactElement } from 'react';
import { PartialMainTask, PartialSubTask, SubTask, Task } from '../../../store/store-types';
import TaskEditor from './TaskEditor';
import {
  addSubTask,
  editMainTask,
  editSubTask,
  removeSubTask,
  removeTask,
} from '../../../firebase/actions';
import { TaskWithSubTasks } from './editors-types';

type Props = {
  readonly original: Task;
  readonly filtered: TaskWithSubTasks;
  readonly className?: string; // additional class names applied to the editor.
};

type TempSubTask =
  | { readonly type: 'UNCOMMITTED'; readonly subTask: SubTask }
  | { readonly type: 'COMMITTED'; readonly subTask: SubTask; readonly prevTempId: string }
  | null;

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({ original, filtered, className }: Props): ReactElement {
  const [disabled, setDisabled] = React.useState(true);
  const [tempSubTask, setTempSubTask] = React.useState<TempSubTask>(null);
  if (tempSubTask !== null && tempSubTask.type === 'COMMITTED') {
    setTempSubTask(null);
  }

  const { id } = original;
  // To un-mount the editor when finished editing.
  const onFocus = (): void => setDisabled(false);
  const onBlur = (): void => {
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
    removeSubTask: (subTaskId: string) => {
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
