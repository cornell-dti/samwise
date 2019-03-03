// @flow strict

// NOTE:
// Other Components in this folder are only designed to be used by TaskEditors.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type {
  Tag, SubTask, PartialMainTask, PartialSubTask, State, MainTask,
} from '../../../../store/store-types';
import OverdueAlert from '../../../UI/OverdueAlert';
import styles from './TaskEditor.css';
import { NONE_TAG } from '../../../../util/tag-util';
import { ignore, randomId } from '../../../../util/general-util';
import { getTodayAtZeroAM } from '../../../../util/datetime-util';
import EditorHeader from './EditorHeader';
import MainTaskEditor from './MainTaskEditor';
import NewSubTaskEditor from './NewSubTaskEditor';
import OneSubTaskEditor from './OneSubTaskEditor';

type DefaultProps = {|
  +className?: string;
  +children?: Node;
  +newSubTaskDisabled?: boolean; // whether to disable new subtask creation
  +onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void; // when the editor gets focus
  +onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void; // when the editor loses focus
  +editorRef?: { current: HTMLFormElement | null }; // the ref of the editor
|};
type Actions = {|
  +editMainTask: (partialMainTask: PartialMainTask) => void;
  // edit a subtask, which can be the one created but cached locally!
  +editSubTask: (subtaskId: string, partialSubTask: PartialSubTask) => void;
  // add a subtask, but cache the subtask locally.
  +addSubTask: (subTask: SubTask) => void;
  +removeTask: () => void;
  // remove the subtask, which can be the one created but cached locally!
  +removeSubTask: (subtaskId: string) => void;
  // save all the edits. remember also to save the locally cached new subtask.
  +onSave: () => void;
|};
type OwnProps = {|
  +mainTask: MainTask; // The task given to the editor at this point.
  +subTasks: SubTask[];
  +tempSubTask: SubTask | null;
  +actions: Actions; // The actions to perform under different events
  ...DefaultProps; // Props with default values.
|};
type Props = {|
  ...OwnProps;
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
    mainTask,
    subTasks,
    tempSubTask,
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
  const { name, tag, date, complete, inFocus } = mainTask;
  const {
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave,
  } = actions;

  const [subTaskToFocus, setSubTaskToFocus] = React.useState<TaskToFocus>(null);

  // called when the user types in the first char in the new subtask box. We need to shift now.
  const handleNewSubTaskFirstType = (firstTypedValue: string) => {
    const order = subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    addSubTask({
      id: randomId(),
      name: firstTypedValue,
      order,
      complete: false,
      inFocus: false,
    });
    setSubTaskToFocus(order);
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
            editSubTask={editSubTask}
            removeSubTask={removeSubTask}
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

const Connected: ComponentType<OwnProps> = connect(
  ({ tags }: State) => ({ getTag: id => tags.get(id) ?? NONE_TAG }),
)(TaskEditor);
export default Connected;
