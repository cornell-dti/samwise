import React, { ReactElement, useState } from 'react';
import { Task } from 'common/types/store-types';
import { removeTaskWithPotentialPrompt } from '../../../util/task-util';
import TaskEditor from './TaskEditor';
import { CalendarPosition } from './editors-types';

type Props = {
  readonly original: Task;
  readonly filtered: Task;
  readonly calendarPosition: CalendarPosition;
  readonly className?: string; // additional class names applied to the editor.
  readonly memberName?: string; // only supplied if the task is a group task
  readonly memberEmail?: string; // only supplied if the task is a group task
  readonly groupID?: string; // only supplied if the task is a group task
  // True if filtering by completed.
  readonly isFocusTaskAndCompleted?: boolean; // only supplied if the task is a focus task.
};

/**
 * The task editor used to edit task inline, activated on focus.
 */
export default function InlineTaskEditor({
  original,
  filtered,
  className,
  calendarPosition,
  memberName,
  memberEmail,
  groupID,
  isFocusTaskAndCompleted,
}: Props): ReactElement {
  const [disabled, setDisabled] = useState(true);
  const { id } = original;
  const { id: _, metadata, children, ...taskData } = filtered;
  const icalUID = original.metadata.type === 'ONE_TIME' ? original.metadata.icalUID : '';
  const taskAppearedDate = metadata.date instanceof Date ? metadata.date.toDateString() : null;
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
      type={metadata.type}
      icalUID={icalUID}
      taskAppearedDate={taskAppearedDate}
      className={className}
      taskData={{ ...taskData, date: metadata.date, children }}
      actions={actions}
      displayGrabber
      calendarPosition={calendarPosition}
      newSubTaskAutoFocused={!original.inFocus}
      active={!disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      memberName={memberName}
      memberEmail={memberEmail}
      groupID={groupID}
      wholeTaskData={isFocusTaskAndCompleted !== undefined ? original : undefined}
      isFocusTaskAndCompleted={isFocusTaskAndCompleted}
    />
  );
}

InlineTaskEditor.defaultProps = { className: undefined };
