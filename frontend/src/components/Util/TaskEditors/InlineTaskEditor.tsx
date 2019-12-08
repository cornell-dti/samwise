import React, { ReactElement, useState } from 'react';
import { removeTaskWithPotentialPrompt } from 'util/task-util';
import { Task } from '../../../store/store-types';
import TaskEditor from './TaskEditor';
import { CalendarPosition, TaskWithSubTasks } from './editors-types';

type Props = {
  readonly original: Task;
  readonly filtered: TaskWithSubTasks;
  readonly calendarPosition: CalendarPosition;
  readonly className?: string; // additional class names applied to the editor.
};

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor(
  { original, filtered, className, calendarPosition }: Props,
): ReactElement {
  const [disabled, setDisabled] = useState(true);
  const { id } = original;
  const { id: _, type, subTasks, ...mainTask } = filtered;
  const taskAppearedDate = mainTask.date instanceof Date ? mainTask.date.toDateString() : null;
  // To un-mount the editor when finished editing.
  const onFocus = (): void => setDisabled(false);
  const onBlur = (): void => setDisabled(true);
  const actions = {
    removeTask: () => removeTaskWithPotentialPrompt(original, null),
    onSaveClicked: onBlur,
  };
  return (
    <TaskEditor
      id={id}
      type={type}
      taskAppearedDate={taskAppearedDate}
      className={className}
      mainTask={mainTask}
      subTasks={subTasks}
      actions={actions}
      displayGrabber
      calendarPosition={calendarPosition}
      newSubTaskAutoFocused={!original.inFocus}
      newSubTaskDisabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

InlineTaskEditor.defaultProps = { className: undefined };
