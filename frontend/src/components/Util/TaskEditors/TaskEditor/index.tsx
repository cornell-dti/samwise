// NOTE:
// Other Components in this folder are only designed to be used by this file.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React, { ReactElement, ReactNode, useState } from 'react';
import { connect } from 'react-redux';
import {
  Tag,
  SubTask,
  PartialMainTask,
  PartialSubTask,
  State,
  MainTask,
} from '../../../../store/store-types';
import OverdueAlert from '../../../UI/OverdueAlert';
import styles from './TaskEditor.css';
import { NONE_TAG } from '../../../../util/tag-util';
import { ignore } from '../../../../util/general-util';
import { getTodayAtZeroAM } from '../../../../util/datetime-util';
import {
  addSubTask as addSubTaskAction,
  editMainTask as editMainTaskAction,
  editSubTask,
  removeSubTask as removeSubTaskAction,
} from '../../../../firebase/actions';
import EditorHeader from './EditorHeader';
import MainTaskEditor from './MainTaskEditor';
import NewSubTaskEditor from './NewSubTaskEditor';
import OneSubTaskEditor from './OneSubTaskEditor';
import { getNewSubTaskId } from '../../../../firebase/id-provider';

type DefaultProps = {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly newSubTaskAutoFocused?: boolean; // whether to auto focus the new subtask
  readonly newSubTaskDisabled?: boolean; // whether to disable new subtask creation
  readonly onFocus?: () => void; // when the editor gets focus
  readonly onBlur?: () => void; // when the editor loses focus
  readonly editorRef?: { current: HTMLFormElement | null }; // the ref of the editor
};
type Actions = {
  // remove the entire task to be edited.
  readonly removeTask: () => void;
  // save all the edits. remember also to save the locally cached new subtask.
  readonly onSave: () => void;
};
type OwnProps = DefaultProps & {
  readonly id: string;
  readonly mainTask: MainTask; // The task given to the editor at this point.
  readonly subTasks: SubTask[];
  readonly actions: Actions; // The actions to perform under different events
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
    mainTask,
    subTasks,
    actions,
    getTag,
    className,
    children,
    newSubTaskAutoFocused,
    newSubTaskDisabled,
    onFocus,
    onBlur,
    editorRef,
  }: Props,
): ReactElement {
  const { name, tag, date, complete, inFocus } = mainTask;
  const { removeTask, onSave } = actions;

  const [tempSubTask, setTempSubTask] = useState<SubTask | null>(null);
  const [subTaskToFocus, setSubTaskToFocus] = useState<TaskToFocus>(null);

  if (tempSubTask != null) {
    subTasks.forEach((oneSubTask) => {
      if (oneSubTask.id === tempSubTask.id) {
        setTempSubTask(null);
      }
    });
  }

  // actions to perform
  const editMainTask = (change: PartialMainTask): void => editMainTaskAction(id, change);
  const addSubTask = (subTask: SubTask): void => addSubTaskAction(id, subTask);
  const removeSubTask = (subtaskId: string): void => removeSubTaskAction(id, subtaskId);

  const onMouseLeave = (): void => {
    if (tempSubTask != null) {
      addSubTask(tempSubTask);
    }
    if (onBlur) {
      onBlur();
    }
  };

  // called when the user types in the first char in the new subtask box. We need to shift now.
  const handleNewSubTaskFirstType = (firstTypedValue: string): void => {
    const order = subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    setTempSubTask({
      id: getNewSubTaskId(),
      name: firstTypedValue,
      order,
      complete: false,
      inFocus: newSubTaskAutoFocused === true,
    });
    setSubTaskToFocus(order);
  };

  const handleNewSubTaskEdit = (_: string, partialSubTask: PartialSubTask): void => {
    if (tempSubTask != null) {
      addSubTask({ ...tempSubTask, ...partialSubTask });
    }
  };

  /**
   * The event handler that handles an press enter event.
   * It will switch the focus as expected.
   *
   * @param {'main-task' | number} caller the caller of the handler.
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
        <EditorHeader tag={tag} date={date} onChange={editMainTask} getTag={getTag} />
        <MainTaskEditor
          name={name}
          complete={complete}
          inFocus={inFocus}
          onChange={editMainTask}
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
            editSubTask={editSubTask}
            removeSubTask={removeSubTask}
            onPressEnter={pressEnterHandler}
          />
        ))}
        {tempSubTask !== null && (
          <OneSubTaskEditor
            subTask={tempSubTask}
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === tempSubTask.order}
            afterFocusedCallback={clearNeedToFocus}
            editSubTask={handleNewSubTaskEdit}
            removeSubTask={() => setTempSubTask(null)}
            onPressEnter={pressEnterHandler}
          />
        )}
        <div
          className={styles.SubtaskHide}
          style={{ maxHeight: newSubTaskDisabled === true ? 0 : 50 }}
        >
          <NewSubTaskEditor
            onChange={handleNewSubTaskFirstType}
            needToBeFocused={subTaskToFocus === 'new-subtask'}
            afterFocusedCallback={clearNeedToFocus}
            onPressEnter={onSave}
          />
        </div>
      </div>
      {children}
    </form>
  );
}

const Connected = connect(
  ({ tags }: State) => ({ getTag: (id: string) => tags.get(id) || NONE_TAG }),
)(TaskEditor);
export default Connected;
