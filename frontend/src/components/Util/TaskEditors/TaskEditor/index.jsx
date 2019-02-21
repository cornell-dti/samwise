// @flow strict

// NOTE:
// Other Components in this folder are only designed to be used by TaskEditors.
// These components' API are NOT guaranteed to be stable.
// You should only use this component from the outside.

import React from 'react';
import type { Node } from 'react';
import type {
  Tag, SubTask, Task, PartialMainTask, PartialSubTask,
} from '../../../../store/store-types';
import OverdueAlert from '../../../UI/OverdueAlert';
import styles from './TaskEditor.css';
import { getTagConnect } from '../../../../util/tag-util';
import { randomId } from '../../../../util/general-util';
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
  +refFunction?: (HTMLElement | null) => void; // used to get the DOM element.
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
  +task: Task; // The task given to the editor at this point.
  +actions: Actions; // The actions to perform under different events
  ...DefaultProps; // Props with default values.
  // subscribed from redux store.
  +getTag: (id: string) => Tag;
|};

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
function TaskEditor(props: Props): Node {
  const {
    task, actions, getTag, className, children, newSubTaskDisabled, onFocus, onBlur, refFunction,
  } = props;
  const {
    name, tag, date, complete, inFocus, subtasks,
  } = task;
  const {
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave,
  } = actions;

  const [subTaskToFocus, setSubTaskToFocus] = React.useState<number | null>(null);

  const tagDateOnChange = change => editMainTask(change, false);
  const nameCompleteInFocusChange = change => editMainTask(change, false);
  const handleNewSubTaskValueChange = (newSubTaskValue: string) => {
    const order = subtasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1;
    const newSubTask: SubTask = {
      id: randomId(),
      name: newSubTaskValue,
      order,
      complete: false,
      inFocus: false,
    };
    addSubTask(newSubTask);
    setSubTaskToFocus(order);
  };

  /**
   * The event handler that handles an press enter event.
   * It will switch the focus as expected.
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} event the event of a keypress.
   */
  const pressEnterHandler = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    const { form } = event.currentTarget;
    if (form == null) {
      throw new Error('Form should not be null!');
    }
    let index = Array.prototype.indexOf.call(form, event.target) + 1;
    while (form.elements[index].tabIndex === -1) {
      index += 1;
    }
    form.elements[index].focus();
  };

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
      onBlur={() => {}}
      ref={refFunction}
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
        {subtasks.map(subTask => (
          <OneSubTaskEditor
            key={subTask.order}
            subTask={subTask}
            mainTaskComplete={complete}
            needToBeFocused={subTaskToFocus === subTask.order}
            afterFocusedCallback={() => setSubTaskToFocus(null)}
            editSubTask={editSubTask}
            removeSubTask={removeSubTask}
            onPressEnter={pressEnterHandler}
          />
        ))}
        {(newSubTaskDisabled !== true) && (
          <NewSubTaskEditor onChange={handleNewSubTaskValueChange} onPressEnter={onSave} />
        )}
      </div>
      {children}
    </form>
  );
}

const ConnectedTaskEditor = getTagConnect<Props>(React.memo<Props>(TaskEditor));
export default ConnectedTaskEditor;
