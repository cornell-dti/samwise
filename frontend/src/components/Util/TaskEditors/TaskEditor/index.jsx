// @flow strict

// NOTE:
// Other Components in this folder are only designed to be used by TaskEditors.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React from 'react';
import type { Node } from 'react';
import type {
  Tag, SubTask, PartialMainTask, PartialSubTask, TaskWithSubTasks,
} from '../../../../store/store-types';
import OverdueAlert from '../../../UI/OverdueAlert';
import styles from './TaskEditor.css';
import { getTagConnect } from '../../../../util/tag-util';
import { ignore, randomId } from '../../../../util/general-util';
import { getTodayAtZeroAM } from '../../../../util/datetime-util';
import EditorHeader from './EditorHeader';
import MainTaskEditor from './MainTaskEditor';
import NewSubTaskEditor from './NewSubTaskEditor';
import OneSubTaskEditor from './OneSubTaskEditor';

type DefaultProps = {|
  +className?: string;
  children?: Node;
  +newSubTaskDisabled?: boolean;
  +onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  +onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  +editorRef?: { current: HTMLFormElement | null };
|};
type Actions = {|
  +editMainTask: (partialMainTask: PartialMainTask, doSave: boolean) => void;
  +editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, doSave: boolean) => void;
  +addSubTask: (subTask: SubTask) => void;
  +removeTask: () => void;
  +removeSubTask: (subtaskId: string) => void;
  +onSave: () => void;
|};
type Props = {|
  +task: TaskWithSubTasks; // The task given to the editor at this point.
  +actions: Actions; // The actions to perform under different events
  ...DefaultProps; // Props with default values.
  // subscribed from redux store.
  +getTag: (id: string) => Tag;
|};

type TaskToFocus = number | 'new-subtask' | null;

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
function TaskEditor(
  {
    task,
    actions,
    getTag,
    className,
    children,
    newSubTaskDisabled,
    onFocus,
    onBlur,
    editorRef,
  }: Props,
): Node {
  const {
    name, tag, date, complete, inFocus, subTasks,
  } = task;
  const {
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave,
  } = actions;

  const [subTaskToFocus, setSubTaskToFocus] = React.useState<TaskToFocus>(() => {
    console.log('recreated!');
    return null;
  });
  console.log(subTaskToFocus);

  const tagDateOnChange = change => editMainTask(change, false);
  const nameCompleteInFocusChange = change => editMainTask(change, false);
  const handleNewSubTaskValueChange = (newSubTaskValue: string) => {
    const order = subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    const newSubTask: SubTask = {
      id: randomId(),
      name: newSubTaskValue,
      order,
      complete: false,
      inFocus: false,
    };
    console.log('new-subtask', newSubTask);
    addSubTask(newSubTask);
    console.log('try to add...');
    setSubTaskToFocus(order);
    console.log('set focus');
  };

  /**
   * The event handler that handles an press enter event.
   * It will switch the focus as expected.
   *
   * @param {'main-task' | number} caller the caller of the handler.
   */
  const pressEnterHandler = (caller: 'main-task' | number) => {
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
  const clearNeedToFocus = () => setSubTaskToFocus(null);

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
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={ignore}
      ref={editorRef}
    >
      {isOverdue && <OverdueAlert />}
      <div>
        <EditorHeader tag={tag} date={date} onChange={tagDateOnChange} getTag={getTag} />
        <MainTaskEditor
          name={name}
          complete={complete}
          inFocus={inFocus}
          onChange={nameCompleteInFocusChange}
          onRemove={removeTask}
          onPressEnter={pressEnterHandler}
        />
      </div>
      <div className={styles.TaskEditorSubTasksIndentedContainer}>
        {subTasks.map(subTask => (
          <OneSubTaskEditor
            key={subTask.order}
            subTask={subTask}
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === subTask.order}
            afterFocusedCallback={clearNeedToFocus}
            editSubTask={editSubTask}
            removeSubTask={removeSubTask}
            onPressEnter={pressEnterHandler}
          />
        ))}
        {(newSubTaskDisabled !== true) && (
          <NewSubTaskEditor
            onChange={handleNewSubTaskValueChange}
            needToBeFocused={subTaskToFocus === 'new-subtask'}
            afterFocusedCallback={clearNeedToFocus}
            onPressEnter={onSave}
          />
        )}
      </div>
      {children}
    </form>
  );
}

const ConnectedTaskEditor = getTagConnect<Props>(TaskEditor);
export default ConnectedTaskEditor;
