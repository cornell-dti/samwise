// NOTE:
// Other Components in this folder are only designed to be used by this file.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import { MainTask, State, SubTask, Tag } from 'store/store-types';
import OverdueAlert from 'components/UI/OverdueAlert';
import { NONE_TAG } from 'util/tag-util';
import { ignore } from 'util/general-util';
import { confirmRepeatedTaskEditMaster, promptRepeatedTaskEditChoice } from 'util/task-util';
import { editTaskWithDiff, forkTaskWithDiff } from 'firebase/actions';
import styles from './index.module.css';
import { getTodayAtZeroAM, getDateWithDateString } from '../../../../util/datetime-util';
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
  // remove the entire task to be edited.
  readonly removeTask: () => void;
  // save all the edits.
  readonly onSave: () => void;
};
type OwnProps = DefaultProps & {
  readonly id: string;
  readonly type: 'MASTER_TEMPLATE' | 'ONE_TIME';
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
  const {
    mainTask,
    subTasks,
    diff,
    dispatchEditMainTask,
    dispatchAddSubTask,
    dispatchEditSubTask,
    dispatchDeleteSubTask,
    reset,
  } = useTaskDiffReducer(initMainTask, initSubTasks);

  const { name, tag, date, complete, inFocus } = mainTask;
  const { removeTask, onSave } = actions;

  const [subTaskToFocus, setSubTaskToFocus] = useState<TaskToFocus>(null);

  const onMouseLeave = (): void => {
    if (onBlur) {
      onBlur();
    }
    onSave();
  };
  const onSaveClicked = (): void => {
    if (type === 'ONE_TIME') {
      editTaskWithDiff(id, 'EDITING_ONE_TIME_TASK', diff);
      return;
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
            const correctDate = diff.mainTaskEdits.date || replaceDate;
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
    onSave();
  };

  // called when the user types in the first char in the new subtask box. We need to shift now.
  const handleNewSubTaskFirstType = (firstTypedValue: string): void => {
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
  const clearNeedToFocus = (): void => setSubTaskToFocus(null);

  const isOverdue = date < getTodayAtZeroAM() && !complete;
  const backgroundColor = getTag(tag).color;
  const formStyle = isOverdue
    ? { backgroundColor, border: '5px solid #D0021B' }
    : { backgroundColor };
  const actualClassName = className == null
    ? styles.TaskEditor : `${styles.TaskEditor} ${className}`;
  return (
    <form
      className={actualClassName}
      style={formStyle}
      onMouseEnter={onFocus}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={ignore}
      ref={editorRef}
    >
      {isOverdue && <OverdueAlert target="task-card" />}
      <div>
        <EditorHeader
          tag={tag}
          date={date}
          onChange={dispatchEditMainTask}
          getTag={getTag}
          calendarPosition={calendarPosition}
          displayGrabber={displayGrabber == null ? false : displayGrabber}
        />
        <MainTaskEditor
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
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === subTask.order}
            afterFocusedCallback={clearNeedToFocus}
            editSubTask={dispatchEditSubTask}
            removeSubTask={dispatchDeleteSubTask}
            onPressEnter={pressEnterHandler}
          />
        ))}
        <div
          className={styles.SubtaskHide}
          style={newSubTaskDisabled === true ? { maxHeight: 0 } : undefined}
        >
          <NewSubTaskEditor
            onChange={handleNewSubTaskFirstType}
            needToBeFocused={subTaskToFocus === 'new-subtask'}
            afterFocusedCallback={clearNeedToFocus}
            onPressEnter={onSaveClicked}
          />
        </div>
      </div>
      <div
        className={styles.SaveButtonRow}
        style={diffIsEmpty(diff) ? { maxHeight: 0, padding: 0 } : undefined}
      >
        <span className={styles.TaskEditorFlexiblePadding} />
        <div role="presentation" className={styles.SaveButton} onClick={onSaveClicked}>
          <span className={styles.SaveButtonText}>Save</span>
        </div>
      </div>
    </form>
  );
}

const Connected = connect(
  ({ tags }: State) => ({ getTag: (id: string) => tags.get(id) || NONE_TAG }),
)(TaskEditor);
export default Connected;
