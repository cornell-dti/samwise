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

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({ original, filtered, className }: Props): ReactElement {
  const [disabled, setDisabled] = React.useState(true);

  const { id } = original;
  // To un-mount the editor when finished editing.
  const onFocus = (): void => setDisabled(false);
  const onBlur = (): void => {
    /*
    if (tempSubTask !== null) {
      addSubTask(id, tempSubTask);
      setTempSubTask(null);
    }
    */
    setDisabled(true);
  };
  const actions = {
    editMainTask: (partialMainTask: PartialMainTask) => editMainTask(id, partialMainTask),
    editSubTask,
    addSubTask: (subTask: SubTask) => addSubTask(id, subTask),
    removeTask: () => removeTask(original),
    removeSubTask: (subTaskId: string) => removeSubTask(id, subTaskId),
    onSave: onBlur,
  };
  const { id: _, subTasks, ...mainTask } = filtered;
  return (
    <TaskEditor
      className={className}
      mainTask={mainTask}
      subTasks={subTasks}
      actions={actions}
      newSubTaskAutoFocused={!original.inFocus}
      newSubTaskDisabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

InlineTaskEditor.defaultProps = { className: undefined };
