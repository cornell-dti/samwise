// NOTE:
// Other Components in this folder are only designed to be used by this file.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React, { ReactElement, useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import {
  TaskMainData,
  Settings,
  State,
  SubTask,
  Tag,
  TaskMetadata,
  Task,
} from 'common/types/store-types';
import { NONE_TAG } from 'common/util/tag-util';
import { ignore } from 'common/util/general-util';
import { getTodayAtZeroAM, getDateWithDateString } from 'common/util/datetime-util';
import {
  getFilteredCompletedInFocusTask,
  getFilteredNotCompletedInFocusTask,
} from 'common/util/task-util';
import {
  confirmRepeatedTaskEditMaster,
  promptRepeatedTaskEditChoice,
} from '../../../../util/task-util';
import { editTaskWithDiff, forkTaskWithDiff } from '../../../../firebase/actions';
import styles from './index.module.scss';
import RepeatFrequencyHeader from './RepeatFrequencyHeader';
import EditorHeader from './EditorHeader';
import MainTaskEditor from './MainTaskEditor';
import NewSubTaskEditor from './NewSubTaskEditor';
import OneSubTaskEditor from './OneSubTaskEditor';
import { CalendarPosition } from '../editors-types';
import useTaskDiffReducer, { diffIsEmpty, Diff } from './task-diff-reducer';
import { getAppUser } from '../../../../firebase/auth-util';

type DefaultProps = {
  readonly displayGrabber?: boolean;
  readonly className?: string;
  readonly newSubTaskAutoFocused?: boolean; // whether to auto focus the new subtask
  readonly active?: boolean; // whether the task is actively being edited.
  readonly onFocus?: () => void; // when the editor gets focus
  readonly onBlur?: () => void; // when the editor loses focus
  readonly editorRef?: { current: HTMLFormElement | null }; // the ref of the editor
};
type Actions = {
  // whenever the user made some edits.
  readonly onChange?: () => void;
  // remove the entire task to be edited.
  readonly removeTask: () => void;
  // save all the edits.
  readonly onSaveClicked: () => void;
};
type OwnProps = DefaultProps & {
  readonly id: string;
  readonly type: 'MASTER_TEMPLATE' | 'ONE_TIME' | 'GROUP';
  readonly icalUID?: string;
  // the date string that specifies when the task appears (useful for repeated task)
  readonly taskAppearedDate: string | null;
  readonly taskData: TaskMainData; // The task given to the editor.
  readonly actions: Actions; // The actions to perform under different events
  readonly calendarPosition: CalendarPosition;
  readonly memberName?: string; // only supplied if task is a group task
  readonly memberEmail?: string; // only supplied if task is a group task
  readonly groupID?: string; // only supplied if task is a group task
  readonly wholeTaskData?: Task<TaskMetadata>; // only supplied if task is a focus task
  readonly isFocusTaskAndCompleted?: boolean; // only supplied if task is in focus view
};
type Props = OwnProps & {
  // subscribed from redux store.
  readonly getTag: (id: string) => Tag;
  readonly settings: Settings;
};

type TaskToFocus = number | 'new-subtask' | null;

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
function TaskEditor({
  id,
  type,
  icalUID,
  taskAppearedDate,
  taskData: initTaskData,
  actions,
  displayGrabber,
  getTag,
  className,
  newSubTaskAutoFocused,
  active,
  onFocus,
  onBlur,
  editorRef,
  calendarPosition,
  settings,
  memberName,
  memberEmail,
  groupID,
  wholeTaskData,
  isFocusTaskAndCompleted,
}: Props): ReactElement {
  const { email } = getAppUser();
  const canMarkComplete = memberEmail === undefined ? true : email === memberEmail;

  const { onChange, removeTask, onSaveClicked } = actions;
  const initTaskDate = initTaskData.date;
  const { taskData, diff, dispatchEditTask, dispatchEditSubTask, reset } = useTaskDiffReducer(
    wholeTaskData ? ({ ...wholeTaskData, date: initTaskDate } as TaskMainData) : initTaskData,
    wholeTaskData ? false : active ?? false,
    wholeTaskData ? ignore : onChange ?? ignore
  );

  const getFilteredTaskData = (fullTask: Task<TaskMetadata>): Task<TaskMetadata> => {
    let filteredTask: Task<TaskMetadata> | null = null;
    if (wholeTaskData) {
      const wholeTaskWithMetadata = { ...wholeTaskData, ...taskData } as Task<TaskMetadata>;
      filteredTask = isFocusTaskAndCompleted
        ? getFilteredCompletedInFocusTask(wholeTaskWithMetadata)
        : getFilteredNotCompletedInFocusTask(wholeTaskWithMetadata);
    }
    if (filteredTask === null) {
      return fullTask;
    }
    return filteredTask;
  };

  const { name, tag, date, complete, inFocus } = taskData;

  const [subTaskToFocus, setSubTaskToFocus] = useState<TaskToFocus>(null);

  const { canvasCalendar } = settings;
  const canvasLinked = canvasCalendar != null;

  const editSubTask = (update: Partial<SubTask>, subTaskToUpdate: SubTask): void => {
    dispatchEditSubTask({
      update,
      order: subTaskToUpdate.order,
      isDelete: false,
    });
  };

  const removeSubTask = (subTaskToRemove: SubTask): void => {
    dispatchEditSubTask({
      order: subTaskToRemove.order,
      isDelete: true,
    });
  };

  const onSave = useCallback((): boolean => {
    if (diffIsEmpty(diff)) {
      return false;
    }
    if (type === 'ONE_TIME' || type === 'GROUP') {
      editTaskWithDiff(id, 'EDITING_ONE_TIME_TASK', diff);
      return true;
    }
    if (taskAppearedDate === null) {
      confirmRepeatedTaskEditMaster().then((saveChoice) => {
        switch (saveChoice) {
          case 'CANCEL_CHANGES':
            reset();
            break;
          case 'CHANGE_MASTER_TEMPLATE':
            editTaskWithDiff(id, 'EDITING_MASTER_TEMPLATE', diff);
            break;
          default:
            throw new Error();
        }
      });
    } else {
      promptRepeatedTaskEditChoice().then((saveChoice) => {
        switch (saveChoice) {
          case 'CANCEL_CHANGES':
            reset();
            break;
          case 'CHANGE_MASTER_TEMPLATE':
            editTaskWithDiff(id, 'EDITING_MASTER_TEMPLATE', diff);
            break;
          case 'FORK': {
            const replaceDate = getDateWithDateString(
              date instanceof Date ? date : null,
              taskAppearedDate
            );
            const correctDate = diff.mainTaskEdits.date ?? replaceDate;
            const diffForFork: Diff = {
              ...diff,
              mainTaskEdits: { ...diff.mainTaskEdits, date: correctDate },
            };
            forkTaskWithDiff(id, replaceDate, diffForFork);
            break;
          }
          default:
            throw new Error();
        }
      });
    }
    return true;
  }, [date, diff, id, reset, taskAppearedDate, type]);

  const onMouseLeave = (): void => {
    if (type !== 'MASTER_TEMPLATE') {
      onSave();
    }
    if (onBlur) {
      onBlur();
    }
  };

  const onSaveButtonClicked = (): void => {
    if (onSave() && type === 'MASTER_TEMPLATE') {
      onSaveClicked();
    }
  };

  // called when the user types in the first char in the new subtask box. We need to shift now.
  const handleCreatedNewSubtask = (firstTypedValue: string): void => {
    const order = taskData.children.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    const createdNewSubtask: SubTask = {
      order,
      name: firstTypedValue,
      complete: false,
      inFocus: newSubTaskAutoFocused === true,
    };
    dispatchEditTask({
      children: [...taskData.children, createdNewSubtask],
    });
    setSubTaskToFocus(order);
  };

  /**
   * The event handler that handles an press enter event.
   * It will switch the focus as expected.
   *
   * @param caller the caller of the handler.
   */
  const pressEnterHandler = (caller: 'main-task' | number): void => {
    const order = caller === 'main-task' ? -1 : caller;
    let focused = false;

    for (let i = 0; i < taskData.children.length; i += 1) {
      const { order: subtaskOrder } = taskData.children[i];
      if (subtaskOrder > order) {
        setSubTaskToFocus(subtaskOrder);
        focused = true;
        break;
      }
    }
    if (!focused) {
      // need to focus the new subtask editor
      setSubTaskToFocus('new-subtask');
    }
  };
  if (taskAppearedDate === null) {
    throw new Error('Impossible');
  }
  const isOverdue = date < getTodayAtZeroAM() && !complete;
  const backgroundColor = getTag(tag).color;
  const formStyle = isOverdue
    ? { backgroundColor, border: '5px solid #D0021B' }
    : { backgroundColor };

  useEffect(() => {
    const intervalID = setInterval(() => {
      if (type !== 'MASTER_TEMPLATE') {
        onSave();
      }
    }, 1000);
    return () => clearInterval(intervalID);
  }, [type, onSave]);

  return (
    <form
      className={clsx(styles.TaskEditor, className)}
      style={formStyle}
      onMouseEnter={onFocus}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onMouseLeave}
      ref={editorRef}
    >
      <div>
        <RepeatFrequencyHeader taskId={id} tag={tag} getTag={getTag} />
        <EditorHeader
          type={type}
          tag={tag}
          date={date}
          onChange={dispatchEditTask}
          getTag={getTag}
          calendarPosition={calendarPosition}
          displayGrabber={displayGrabber == null ? false : displayGrabber}
          icalUID={canvasLinked ? icalUID : undefined}
          editorRef={editorRef}
          isOverdue={isOverdue}
        />
        <MainTaskEditor
          id={id}
          icalUID={canvasLinked ? icalUID : undefined}
          taskDate={date instanceof Date ? date : null}
          dateAppeared={taskAppearedDate}
          name={name}
          complete={complete}
          inFocus={inFocus}
          onChange={dispatchEditTask}
          onRemove={removeTask}
          onPressEnter={pressEnterHandler}
          memberName={memberName}
          memberEmail={memberEmail}
          groupID={groupID}
          canMarkComplete={canMarkComplete}
        />
      </div>
      <div className={styles.TaskEditorSubTasksIndentedContainer}>
        {(wholeTaskData !== undefined
          ? getFilteredTaskData(wholeTaskData).children
          : taskData.children
        ).map((subTask: SubTask) => (
          <OneSubTaskEditor
            key={subTask.order}
            subTask={subTask}
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === subTask.order}
            onEdit={editSubTask}
            onRemove={removeSubTask}
            onPressEnter={pressEnterHandler}
            memberName={memberName}
            canMarkComplete={canMarkComplete}
          />
        ))}
        <div className={styles.SubtaskHide} style={active === false ? { maxHeight: 0 } : undefined}>
          <NewSubTaskEditor
            onFirstType={handleCreatedNewSubtask}
            onPressEnter={onSaveButtonClicked}
            needToBeFocused={subTaskToFocus === 'new-subtask'}
          />
        </div>
        {memberName ? <p className={styles.GroupMemberNameText}>@{memberName}</p> : null}
      </div>
      {type === 'MASTER_TEMPLATE' && (
        <div
          className={styles.SaveButtonRow}
          style={diffIsEmpty(diff) ? { maxHeight: 0, padding: 0 } : undefined}
        >
          <span className={styles.TaskEditorFlexiblePadding} />
          <div role="presentation" className={styles.SaveButton} onClick={onSaveButtonClicked}>
            <span className={styles.SaveButtonText}>Save</span>
          </div>
        </div>
      )}
    </form>
  );
}

const Connected = connect(({ tags, settings }: State, ownProps: OwnProps) => ({
  getTag: (id: string) => {
    if (ownProps.type === 'GROUP') {
      // Treat tag id as class code
      return (
        Array.from(tags.values()).find(({ classId }) => {
          if (classId == null) return false;
          // classId has the format `<id from roster> <subject> <number>`, we take the later two parts.
          return classId.substring(classId.indexOf(' ') + 1) === id;
        }) ?? NONE_TAG
      );
    }
    return tags.get(id) ?? NONE_TAG;
  },
  settings,
}))(TaskEditor);
export default Connected;
