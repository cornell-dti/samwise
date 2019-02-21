// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type {
  Tag, SubTask, Task, PartialMainTask, PartialSubTask,
} from '../../../store/store-types';
import TagListPicker from '../TagListPicker/TagListPicker';
import CheckBox from '../../UI/CheckBox';
import OverdueAlert from '../../UI/OverdueAlert';
import styles from './TaskEditor.css';
import { getTagConnect } from '../../../util/tag-util';
import { randomId } from '../../../util/general-util';
import { getTodayAtZeroAM } from '../../../util/datetime-util';

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
/*
type State = {|
  +mainTaskNameCache: string | null;
  +oneSubTaskNameCache: [string, string] | null;
  +doesShowTagEditor: boolean;
  +doesShowDateEditor: boolean;
  +needToSwitchFocus: number | null; // number: expected array length, null: don't switch
|};
*/

type EditorDisplayStatus = {|
  +doesShowTagEditor: boolean;
  +doesShowDateEditor: boolean;
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
    name: taskName, tag, date, complete, inFocus, subtasks,
  } = task;
  const {
    editMainTask, editSubTask, addSubTask, removeTask, removeSubTask, onSave,
  } = actions;

  const [mainTaskNameCache, setMainTaskNameCache] = React.useState<string | null>(null);
  const [oneSubTaskNameCache, setOneSubTaskNameCache] = React.useState<[string, string] | null>(
    null,
  );
  const [editorDisplayStatus, setEditorDisplayStatus] = React.useState<EditorDisplayStatus>({
    doesShowTagEditor: false,
    doesShowDateEditor: false,
  });
  const [needToSwitchFocus, setNeedToSwitchFocus] = React.useState<number | null>(null);

  const toggleTagEditor = () => setEditorDisplayStatus(prev => ({
    doesShowTagEditor: !prev.doesShowTagEditor, doesShowDateEditor: false,
  }));
  const toggleDateEditor = () => setEditorDisplayStatus(prev => ({
    doesShowTagEditor: false, doesShowDateEditor: !prev.doesShowDateEditor,
  }));

  const editTaskNameCache = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    setMainTaskNameCache(event.currentTarget.value);
  };
  const editTaskName = (event?: SyntheticEvent<>): void => {
    if (event) {
      event.stopPropagation();
    }
    const doSave = event == null;
    if (mainTaskNameCache !== null) {
      editMainTask({ name: mainTaskNameCache }, doSave);
      setMainTaskNameCache(null);
    } else if (oneSubTaskNameCache !== null) {
      const [subtaskId, name] = oneSubTaskNameCache;
      editSubTask(subtaskId, { name }, doSave);
      setOneSubTaskNameCache(null);
    } else if (doSave) {
      onSave();
    }
  };
  const editTaskTag = (t: string): void => {
    editMainTask({ tag: t }, false);
    setEditorDisplayStatus(prev => ({ ...prev, doesShowTagEditor: false }));
  };
  const editTaskDate = (dateString: string): void => {
    editMainTask({ date: new Date(dateString) }, false);
    setEditorDisplayStatus(prev => ({ ...prev, doesShowDateEditor: false }));
  };
  const editComplete = () => editMainTask({ complete: !complete }, false);
  const editInFocus = () => editMainTask({ inFocus: !inFocus }, false);
  const editSubTaskNameCache = (subtaskId: string) => (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setOneSubTaskNameCache([subtaskId, event.currentTarget.value]);
  };
  const editSubTaskComplete = (subTask: SubTask) => (): void => {
    editSubTask(subTask.id, { complete: !subTask.complete }, false);
  };
  const editSubTaskInFocus = (subTask: SubTask) => (): void => {
    editSubTask(subTask.id, { inFocus: !subTask.inFocus }, false);
  };
  const handleNewSubTaskValueChange = (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    if (newSubTaskValue.length === 0) {
      return;
    }
    const maxOrder = subtasks.reduce((acc, s) => Math.max(acc, s.order), 0);
    const newSubTask: SubTask = {
      name: newSubTaskValue,
      id: randomId(),
      order: maxOrder + 1,
      complete: false,
      inFocus: false,
    };
    addSubTask(newSubTask);
    setNeedToSwitchFocus(subtasks.length + 1);
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
    // event.stopPropagation();
    if (event.shiftKey) {
      editTaskName();
      event.currentTarget.blur();
      return;
    }
    const { form } = event.currentTarget;
    if (form == null) {
      throw new Error('Form should not be null!');
    }
    const index = Array.prototype.indexOf.call(form, event.target);
    form.elements[index + 1].focus();
  };
  /**
   * The event handler that handles an press enter event for adding a new subtask.
   * It will automatically submit the edited task.
   * It will only be called when there is nothing in the new input box and the user presses ENTER.
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} event the event of a keypress.
   */
  const newSubTaskPressEnterHandler = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSave();
    }
  };

  const Header = (): Node => {
    const { doesShowTagEditor, doesShowDateEditor } = editorDisplayStatus;
    const headerClassName = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
    const tagDisplay = (
      <button type="button" className={styles.TaskEditorTag} onClick={toggleTagEditor}>
        {getTag(tag).name}
      </button>
    );
    const tagEditor = doesShowTagEditor && (
      <div className={styles.TaskEditorTagEditor}>
        <TagListPicker onTagChange={editTaskTag} />
      </div>
    );
    const dateDisplay = (<span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>);
    const dateEditor = doesShowDateEditor && (
      <Calendar
        value={date}
        className={styles.TaskEditorCalendar}
        minDate={new Date()}
        onChange={editTaskDate}
      />
    );
    return (
      <div className={headerClassName}>
        {tagDisplay}
        {tagEditor}
        <span className={styles.TaskEditorFlexiblePadding} />
        <Icon
          name="calendar"
          className={styles.TaskEditorIconButton}
          onClick={toggleDateEditor}
        />
        {dateDisplay}
        {dateEditor}
      </div>
    );
  };

  const MainTaskEdit = (): Node => {
    const taskNameValue = mainTaskNameCache === null ? taskName : mainTaskNameCache;
    const onRemove = () => {
      removeTask();
    };
    return (
      <div className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete}
          onChange={editComplete}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Main Task"
          value={taskNameValue}
          onKeyDown={pressEnterHandler}
          onChange={editTaskNameCache}
          onBlur={editTaskName}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={editInFocus}
        />
        <Icon className={styles.TaskEditorIcon} name="delete" onClick={onRemove} />
      </div>
    );
  };

  const renderSubTask = (subTask: SubTask, index: number, array: SubTask[]): Node => {
    const refHandler = (inputElementRef) => {
      if (needToSwitchFocus === array.length
        && index === array.length - 1
        && inputElementRef != null) {
        inputElementRef.focus();
        setNeedToSwitchFocus(null);
      }
    };
    const onRemoveSubTask = () => removeSubTask(subTask.id);
    const subTaskName = (oneSubTaskNameCache === null || oneSubTaskNameCache[0] !== subTask.id)
      ? subTask.name : oneSubTaskNameCache[1];
    return (
      <div
        key={subTask.order}
        className={[styles.TaskEditorFlexibleContainer, styles.TaskEditorSubtaskCheckBox]}
      >
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete || subTask.complete}
          disabled={complete}
          onChange={editSubTaskComplete(subTask)}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Your Subtask"
          value={subTaskName}
          ref={refHandler}
          onKeyDown={pressEnterHandler}
          onChange={editSubTaskNameCache(subTask.id)}
          onBlur={editTaskName}
          style={{ width: 'calc(100% - 70px)' }}
        />
        <Icon
          name={subTask.inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={editSubTaskInFocus(subTask)}
        />
        <Icon name="delete" className={styles.TaskEditorIcon} onClick={onRemoveSubTask} />
      </div>
    );
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
        <Header />
        <MainTaskEdit />
      </div>
      <div className={styles.TaskEditorSubTasksIndentedContainer}>
        {subtasks.map(renderSubTask)}
        {(newSubTaskDisabled !== true) && (
          <div className={styles.TaskEditorFlexibleContainer}>
            <input
              className={styles.TaskEditorFlexibleInput}
              placeholder="A new subtask"
              value=""
              onChange={handleNewSubTaskValueChange}
              onKeyDown={newSubTaskPressEnterHandler}
            />
          </div>
        )}
      </div>
      {children}
    </form>
  );
}

const ConnectedTaskEditor = getTagConnect<Props>(TaskEditor);
export default ConnectedTaskEditor;
