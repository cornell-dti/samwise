// @flow strict

import React from 'react';
import type { Node } from 'react';
import Calendar from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import Dark from '../../../assets/svgs/dark.svg';
import Delete from '../../../assets/svgs/X.svg';
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
type Props = {|
  ...Task; // The task given to the editor at this point.
  ...DefaultProps; // Props with default values.
  // actions
  +editMainTask: (partialMainTask: PartialMainTask, doSave: boolean) => void;
  +editSubTask: (subtaskId: string, partialSubTask: PartialSubTask, doSave: boolean) => void;
  +addSubTask: (subTask: SubTask) => void;
  +removeTask: () => void;
  +removeSubTask: (subtaskId: string) => void;
  +onSave: () => void;
  // subscribed from redux store.
  +getTag: (id: string) => Tag;
|};

type State = {|
  +mainTaskNameCache: string | null;
  +oneSubTaskNameCache: [string, string] | null;
  +doesShowTagEditor: boolean;
  +doesShowDateEditor: boolean;
  +needToSwitchFocus: number | null; // number: expected array length, null: don't switch
|};

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
class TaskEditor extends React.Component<Props, State> {
  state: State = {
    mainTaskNameCache: null,
    oneSubTaskNameCache: null,
    doesShowTagEditor: false,
    doesShowDateEditor: false,
    needToSwitchFocus: null,
  };

  shouldComponentUpdate(nextProps: Props, { needToSwitchFocus: nextNeed }: State): boolean {
    const { needToSwitchFocus: currNeed } = this.state;
    // Previously need to switch focus, now we don't need any more.
    // In this case, we don't need to re-render.
    return !(currNeed !== null && !nextNeed);
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Toggle Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Toggle the editor for the tag of the task.
   */
  toggleTagEditor = () => this.setState((state: State) => ({
    doesShowTagEditor: !state.doesShowTagEditor, doesShowDateEditor: false,
  }));

  /**
   * Toggle the editor of the deadline of the task.
   */
  toggleDateEditor = () => this.setState((state: State) => ({
    doesShowTagEditor: false, doesShowDateEditor: !state.doesShowDateEditor,
  }));

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Editor Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Edit the cache for task name.
   *
   * @param {SyntheticEvent<HTMLInputElement>} event the event to notify the name change.
   */
  editTaskNameCache = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const mainTaskNameCache = event.currentTarget.value;
    this.setState({ mainTaskNameCache });
  };

  /**
   * Change the name of a task and clear cache.
   *
   * @param {SyntheticEvent<>} event the event to notify the name change.
   */
  editTaskName = (event?: SyntheticEvent<>): void => {
    if (event) {
      event.stopPropagation();
    }
    const doSave = event == null;
    const { mainTaskNameCache, oneSubTaskNameCache } = this.state;
    if (mainTaskNameCache !== null) {
      const { editMainTask } = this.props;
      editMainTask({ name: mainTaskNameCache }, doSave);
      this.setState({ mainTaskNameCache: null });
    } else if (oneSubTaskNameCache !== null) {
      const [subtaskId, name] = oneSubTaskNameCache;
      const { editSubTask } = this.props;
      editSubTask(subtaskId, { name }, doSave);
      this.setState({ oneSubTaskNameCache: null });
    } else if (doSave) {
      const { onSave } = this.props;
      onSave();
    }
  };

  editTaskTag = (tag: string): void => {
    const { editMainTask } = this.props;
    editMainTask({ tag }, false);
    this.setState({ doesShowTagEditor: false });
  };

  editTaskDate = (dateString: string): void => {
    const date = new Date(dateString);
    const { editMainTask } = this.props;
    editMainTask({ date }, false);
    this.setState({ doesShowDateEditor: false });
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = () => {
    const { complete, editMainTask } = this.props;
    editMainTask({ complete: !complete }, false);
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = () => {
    const { inFocus, editMainTask } = this.props;
    editMainTask({ inFocus: !inFocus }, false);
  };

  /**
   * Edit the cache for task name.
   *
   * @param {string} subtaskId id of the subtask.
   * @return {function(SyntheticEvent<HTMLInputElement>): void} event handler.
   */
  editSubTaskNameCache = (subtaskId: string) => (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const oneSubTaskNameCache = [subtaskId, event.currentTarget.value];
    this.setState({ oneSubTaskNameCache });
  };

  /**
   * Toggle one particular subtask's completion.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskComplete = (subTask: SubTask) => (): void => {
    const { editSubTask } = this.props;
    editSubTask(subTask.id, { complete: !subTask.complete }, false);
  };

  /**
   * Toggle one particular subtask's in focus status.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskInFocus = (subTask: SubTask) => (): void => {
    const { editSubTask } = this.props;
    editSubTask(subTask.id, { inFocus: !subTask.inFocus }, false);
  };

  /**
   * Update the state when the new line of subtask name changes.
   *
   * @param {SyntheticEvent<HTMLInputElement>} event the event that notifies about the change and
   * contains the new value.
   */
  handleNewSubTaskValueChange = (event: SyntheticEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSubTaskValue: string = event.currentTarget.value.trim();
    if (newSubTaskValue.length === 0) {
      return;
    }
    const { subtasks } = this.props;
    const maxOrder = subtasks.reduce((acc, s) => Math.max(acc, s.order), 0);
    const newSubTask: SubTask = {
      name: newSubTaskValue,
      id: randomId(),
      order: maxOrder + 1,
      complete: false,
      inFocus: false,
    };
    const { addSubTask } = this.props;
    addSubTask(newSubTask);
    this.setState({ needToSwitchFocus: subtasks.length + 1 });
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Keyboard Shortcut Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * The event handler that handles an press enter event.
   * It will switch the focus as expected.
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} event the event of a keypress.
   */
  pressEnterHandler = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    // event.stopPropagation();
    if (event.shiftKey) {
      this.editTaskName();
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
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} event the event of a keypress.
   */
  newSubTaskPressEnterHandler = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { onSave } = this.props;
      onSave();
    }
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 4: Render Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Return the rendered header element.
   *
   * @return {Node} the rendered header node.
   */
  renderHeader = (): Node => {
    const { tag, date, getTag } = this.props;
    const { doesShowTagEditor, doesShowDateEditor } = this.state;
    const className = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
    const tagDisplay = (
      <button type="button" className={styles.TaskEditorTag} onClick={this.toggleTagEditor}>
        {getTag(tag).name}
      </button>
    );
    const tagEditor = doesShowTagEditor && (
      <div className={styles.TaskEditorTagEditor}>
        <TagListPicker onTagChange={this.editTaskTag} />
      </div>
    );
    const dateDisplay = (<span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>);
    const dateEditor = doesShowDateEditor && (
      <img
        src={Calendar}
        alt="X"
        value={date}
        className={styles.TaskEditorCalendar}
        minDate={new Date()}
        onChange={this.editTaskDate}
      />
    );
    return (
      <div className={className}>
        {tagDisplay}
        {tagEditor}
        <span className={styles.TaskEditorFlexiblePadding} />
        <Dark
          className={styles.TaskEditorIconButton}
          onClick={this.toggleDateEditor}
        />
        {dateDisplay}
        {dateEditor}
      </div>
    );
  };

  /**
   * Return the rendered main task text editor element.
   *
   * @return {Node} the rendered main task edit node.
   */
  renderMainTaskEdit = (): Node => {
    const {
      name, complete, inFocus, removeTask,
    } = this.props;
    const { mainTaskNameCache } = this.state;
    const taskNameValue = mainTaskNameCache === null ? name : mainTaskNameCache;
    const onRemove = () => {
      removeTask();
    };
    return (
      <div className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete}
          onChange={this.editComplete}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Main Task"
          value={taskNameValue}
          onKeyDown={this.pressEnterHandler}
          onChange={this.editTaskNameCache}
          onBlur={this.editTaskName}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editInFocus}
        />
        {/*onClick={onRemove}*/}
        <img src={Delete} alt="X" className={styles.TaskEditorIcon} />
      </div>
    );
  };

  /**
   * Render a subtask.
   *
   * @param {SubTask} subTask one subtask.
   * @param {number} index index of the subtask.
   * @param {SubTask[]} array the entire subtask array.
   * @return {Node} the rendered subtask.
   */
  renderSubTask = (subTask: SubTask, index: number, array: SubTask[]): Node => {
    const { complete, removeSubTask } = this.props;
    const { oneSubTaskNameCache, needToSwitchFocus } = this.state;
    const refHandler = (inputElementRef) => {
      if (needToSwitchFocus === array.length
        && index === array.length - 1
        && inputElementRef != null) {
        inputElementRef.focus();
        this.setState({ needToSwitchFocus: null });
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
          onChange={this.editSubTaskComplete(subTask)}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Your Subtask"
          value={subTaskName}
          ref={refHandler}
          onKeyDown={this.pressEnterHandler}
          onChange={this.editSubTaskNameCache(subTask.id)}
          onBlur={this.editTaskName}
          style={{ width: 'calc(100% - 70px)' }}
        />
        <Icon
          name={subTask.inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editSubTaskInFocus(subTask)}
        />
        {/*onClick={onRemoveSubTask}*/}
        <img src={Delete} alt="X" className={styles.TaskEditorIcon} />
      </div>
    );
  };

  render(): Node {
    const {
      tag, complete, date, subtasks, newSubTaskDisabled, children,
      className, onFocus, onBlur, refFunction, getTag,
    } = this.props;
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
          {this.renderHeader()}
          {this.renderMainTaskEdit()}
        </div>
        <div className={styles.TaskEditorSubTasksIndentedContainer}>
          {subtasks.map(this.renderSubTask)}
          {(newSubTaskDisabled !== true) && (
            <div className={styles.TaskEditorFlexibleContainer}>
              <input
                className={styles.TaskEditorFlexibleInput}
                placeholder="A new subtask"
                value=""
                onChange={this.handleNewSubTaskValueChange}
                onKeyDown={this.newSubTaskPressEnterHandler}
              />
            </div>
          )}
        </div>
        {children}
      </form>
    );
  }
}

const ConnectedTaskEditor = getTagConnect<Props>(TaskEditor);
export default ConnectedTaskEditor;
