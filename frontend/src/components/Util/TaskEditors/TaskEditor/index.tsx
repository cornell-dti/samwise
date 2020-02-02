// NOTE:
// Other Components in this folder are only designed to be used by this file.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React, { ReactElement, useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { MainTask, State, SubTask, Tag } from 'common/lib/types/store-types';
import OverdueAlert from 'components/UI/OverdueAlert';
import { NONE_TAG } from 'common/lib/util/tag-util';
import { ignore } from 'common/lib/util/general-util';
import { confirmRepeatedTaskEditMaster, promptRepeatedTaskEditChoice } from 'util/task-util';
import { editTaskWithDiff, forkTaskWithDiff } from 'firebase/actions';
import { getTodayAtZeroAM, getDateWithDateString } from 'common/lib/util/datetime-util';
import styles from './index.module.css';
import RepeatFrequencyHeader from './RepeatFrequencyHeader';
import EditorHeader from './EditorHeader';
import MainTaskEditor from './MainTaskEditor';
import NewSubTaskEditor from './NewSubTaskEditor';
import OneSubTaskEditor from './OneSubTaskEditor';
import { CalendarPosition } from '../editors-types';
import useTaskDiffReducer, { diffIsEmpty, Diff } from './task-diff-reducer';


type DefaultProps = {
  readonly displayGrabber?: boolean;
  readonly className?: string;
  readonly newSubTaskAutoFocused?: boolean; // whether to auto focus the new subtask
  readonly newSubTaskDisabled?: boolean; // whether to disable new subtask creation
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
  readonly type: 'MASTER_TEMPLATE' | 'ONE_TIME';
  readonly icalUID?: string;
  // the date string that specifies when the task appears (useful for repeated task)
  readonly taskAppearedDate: string | null;
  readonly mainTask: MainTask; // The task given to the editor.
  // The subtask given to the editor. It should only contain those that should be displayed.
  readonly subTasks: readonly SubTask[];
  readonly actions: Actions; // The actions to perform under different events
  readonly calendarPosition: CalendarPosition;
};
type Props = OwnProps & {
  // subscribed from redux store.
  readonly getTag: (id: string) => Tag;
};

type TaskToFocus = number | 'new-subtask' | null;

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
function TaskEditor(
  {
    id,
    type,
    icalUID,
    taskAppearedDate,
    mainTask: initMainTask,
    subTasks: initSubTasks,
    actions,
    displayGrabber,
    getTag,
    className,
    newSubTaskAutoFocused,
    newSubTaskDisabled,
    onFocus,
    onBlur,
    editorRef,
    calendarPosition,
  }: Props,
): ReactElement {
  const { onChange, removeTask, onSaveClicked } = actions;
  const {
    mainTask,
    subTasks,
    diff,
    dispatchEditMainTask,
    dispatchAddSubTask,
    dispatchEditSubTask,
    dispatchDeleteSubTask,
    reset,
  } = useTaskDiffReducer(initMainTask, initSubTasks, onChange ?? ignore);

  const { name, tag, date, complete, inFocus } = mainTask;

  const [subTaskToFocus, setSubTaskToFocus] = useState<TaskToFocus>(null);

  const onMouseLeave = (): void => {
    if (type === 'ONE_TIME') {
      onSave();
    }
    if (onBlur) {
      onBlur();
    }
  };
  const onSave = useCallback((): boolean => {
    if (diffIsEmpty(diff)) {
      return false;
    }
    if (type === 'ONE_TIME') {
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
              date instanceof Date ? date : null, taskAppearedDate,
            );
            const correctDate = diff.mainTaskEdits.date ?? replaceDate;
            const diffForFork: Diff = {
              ...diff, mainTaskEdits: { ...diff.mainTaskEdits, date: correctDate },
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
  const onSaveButtonClicked = (): void => {
    if (onSave() && type !== 'ONE_TIME') {
      onSaveClicked();
    }
  };

  // called when the user types in the first char in the new subtask box. We need to shift now.
  const handleCreatedNewSubtask = (firstTypedValue: string): void => {
    const order = subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    dispatchAddSubTask({
      order, name: firstTypedValue, complete: false, inFocus: newSubTaskAutoFocused === true,
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
    for (let i = 0; i < subTasks.length; i += 1) {
      const { order: subtaskOrder } = subTasks[i];
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
  const actualClassName = className == null
    ? styles.TaskEditor : `${styles.TaskEditor} ${className}`;

  useEffect(() => {
    const intervalID = setInterval(() => {
      if (type === 'ONE_TIME') {
        onSave();
      }
    }, 1000);
    return () => clearInterval(intervalID);
  }, [type, onSave]);

  return (
    <form
      className={actualClassName}
      style={formStyle}
      onMouseEnter={onFocus}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onMouseLeave}
      ref={editorRef}
    >
      {isOverdue && <OverdueAlert target="task-card" />}
      <div>
        <RepeatFrequencyHeader
          taskId={id}
          tag={tag}
          getTag={getTag}
        />
        <EditorHeader
          tag={tag}
          date={date}
          onChange={dispatchEditMainTask}
          getTag={getTag}
          calendarPosition={calendarPosition}
          displayGrabber={displayGrabber == null ? false : displayGrabber}
        />
        <MainTaskEditor
          id={id}
          icalUID={icalUID}
          taskDate={date instanceof Date ? date : null}
          dateAppeared={taskAppearedDate}
          name={name}
          complete={complete}
          inFocus={inFocus}
          onChange={dispatchEditMainTask}
          onRemove={removeTask}
          onPressEnter={pressEnterHandler}
        />
      </div>
      <div className={styles.TaskEditorSubTasksIndentedContainer}>
        {subTasks.map((subTask: SubTask) => (
          <OneSubTaskEditor
            key={subTask.id}
            subTask={subTask}
            mainTaskId={id}
            taskDate={date instanceof Date ? date : null}
            dateAppeared={taskAppearedDate}
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === subTask.order}
            editThisSubTask={dispatchEditSubTask}
            removeSubTask={dispatchDeleteSubTask}
            onPressEnter={pressEnterHandler}
          />
        ))}
        <div
          className={styles.SubtaskHide}
          style={newSubTaskDisabled === true ? { maxHeight: 0 } : undefined}
        >
          <NewSubTaskEditor
            onFirstType={handleCreatedNewSubtask}
            onPressEnter={onSaveButtonClicked}
            needToBeFocused={subTaskToFocus === 'new-subtask'}
            type={type}
          />
        </div>
      </div>
      {
        type !== 'ONE_TIME' && (
          <div
            className={styles.SaveButtonRow}
            style={diffIsEmpty(diff) ? { maxHeight: 0, padding: 0 } : undefined}
          >
            <span className={styles.TaskEditorFlexiblePadding} />
            <div role="presentation" className={styles.SaveButton} onClick={onSaveButtonClicked}>
              <span className={styles.SaveButtonText}>Save</span>
            </div>
          </div>
        )
      }
    </form>
  );
}

const Connected = connect(
  ({ tags }: State) => ({ getTag: (id: string) => tags.get(id) ?? NONE_TAG }),
)(TaskEditor);
export default Connected;
