// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type {
  Tag, State as StoreState, SubTask, Task, PartialMainTask, PartialSubTask,
} from '../../store/store-types';
import TagListPicker from '../TagListPicker/TagListPicker';
import CheckBox from '../UI/CheckBox';
import styles from './TaskEditor.css';
import { simpleConnect } from '../../store/react-redux-util';
import { getNameByTagId, getColorByTagId } from '../../util/tag-util';
import { randomId } from '../../util/general-util';

type Actions = {|
  +editMainTask: (partialMainTask: PartialMainTask) => void;
  +editSubTask: (subtaskId: number, partialSubTask: PartialSubTask) => void;
  +addSubTask: (subTask: SubTask) => void;
  +removeTask: () => void;
  +removeSubTask: (subtaskId: number) => void;
|};
type DefaultProps = {|
  +className?: string;
  children?: Node;
  +disabled?: boolean;
  +onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  +onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  +refFunction?: (HTMLElement | null) => void; // used to get the DOM element.
|};
type OwnProps = {|
  ...Task; // The task given to the editor at this point.
  ...Actions; // Various editor actions.
  ...DefaultProps; // Props with default values.
|};
type SubscribedProps = {| +tags: Tag[]; |};
type Props = {| ...OwnProps; ...SubscribedProps; |};

type State = {|
  +doesShowTagEditor: boolean;
  +doesShowDateEditor: boolean;
  +needToSwitchFocus: boolean;
|};

/**
 * The component of an standalone task editor.
 * It is designed to be wrapped inside another component to extend its functionality. The task
 * editor itself does not remember the state of editing a task, a wrapper component should.
 * You can read the docs for props above.
 */
class TaskEditor extends React.PureComponent<Props, State> {
  state: State = {
    doesShowTagEditor: false,
    doesShowDateEditor: false,
    needToSwitchFocus: false,
  };

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
   * Change the name of the task.
   *
   * @param {SyntheticEvent<HTMLInputElement>} event the event to notify the name change.
   */
  editTaskName = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    const { editMainTask } = this.props;
    editMainTask({ name });
  };

  /**
   * Edit the tag of the task.
   *
   * @param {number} tag the new tag id.
   */
  editTaskTag = (tag: number): void => {
    const { editMainTask } = this.props;
    editMainTask({ tag });
    this.setState({ doesShowTagEditor: false });
  };

  /**
   * Edit the new date of the task.
   *
   * @param {string} dateString the new date in string.
   */
  editTaskDate = (dateString: string): void => {
    const date = new Date(dateString);
    const { editMainTask } = this.props;
    editMainTask({ date });
    this.setState({ doesShowDateEditor: false });
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = () => {
    const { complete, editMainTask } = this.props;
    editMainTask({ complete: !complete });
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = () => {
    const { inFocus, editMainTask } = this.props;
    editMainTask({ inFocus: !inFocus });
  };

  /**
   * Edit one particular subtask's name.
   *
   * @param {number} subtaskId the id of the subtask.
   * @return {function(SyntheticEvent<HTMLInputElement>): void} the function to handle a edit
   * subtask event that notifies
   * about the edit and gives the new value of the subtask.
   */
  editSubTaskName = (subtaskId: number) => (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    const { editSubTask } = this.props;
    editSubTask(subtaskId, { name });
  };

  /**
   * Edit one particular subtask's completion.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskComplete = (subTask: SubTask) => (): void => {
    const { editSubTask } = this.props;
    editSubTask(subTask.id, { complete: !subTask.complete });
  };

  /**
   * Edit one particular subtask's in focus status.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskInFocus = (subTask: SubTask) => (): void => {
    const { editSubTask } = this.props;
    editSubTask(subTask.id, { inFocus: !subTask.inFocus });
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
    const newSubTask: SubTask = {
      name: newSubTaskValue,
      id: randomId(),
      complete: false,
      inFocus: false,
    };
    const { addSubTask } = this.props;
    addSubTask(newSubTask);
    this.setState({ needToSwitchFocus: true });
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Render Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Return the rendered header element.
   *
   * @return {Node} the rendered header node.
   */
  renderHeader = (): Node => {
    const { tag, date, tags } = this.props;
    const { doesShowTagEditor, doesShowDateEditor } = this.state;
    const className = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
    const tagDisplay = (
      <button type="button" className={styles.TaskEditorTag} onClick={this.toggleTagEditor}>
        {getNameByTagId(tags, tag)}
      </button>
    );
    const tagEditor = doesShowTagEditor && (
      <div className={styles.TaskEditorTagEditor}>
        <TagListPicker onTagChange={this.editTaskTag} />
      </div>
    );
    const dateDisplay = (<span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>);
    const dateEditor = doesShowDateEditor && (
      <Calendar
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
        <Icon
          name="calendar"
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
          value={name}
          onChange={this.editTaskName}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editInFocus}
        />
        <Icon className={styles.TaskEditorIcon} name="delete" onClick={removeTask} />
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
    const { needToSwitchFocus } = this.state;
    const refHandler = (inputElementRef) => {
      if (index === array.length - 1 && needToSwitchFocus && inputElementRef != null) {
        inputElementRef.focus();
        this.setState({ needToSwitchFocus: false });
      }
    };
    return (
      <div key={subTask.id} className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete || subTask.complete}
          disabled={complete}
          onChange={this.editSubTaskComplete(subTask)}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          value={subTask.name}
          ref={refHandler}
          onChange={this.editSubTaskName(subTask.id)}
        />
        <Icon
          name={subTask.inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editSubTaskInFocus(subTask)}
        />
        <Icon
          name="delete"
          className={styles.TaskEditorIcon}
          onClick={() => removeSubTask(subTask.id)}
        />
      </div>
    );
  };

  render(): Node {
    const {
      tag, subtaskArray, disabled, children,
      className, onFocus, onBlur, refFunction, tags,
    } = this.props;
    const backgroundColor = getColorByTagId(tags, tag);
    const actualClassName = className == null
      ? styles.TaskEditor : `${styles.TaskEditor} ${className}`;
    return (
      <form
        className={actualClassName}
        style={{ backgroundColor }}
        onMouseEnter={onFocus}
        onMouseLeave={onBlur}
        onFocus={onFocus}
        onBlur={() => {}}
        ref={refFunction}
      >
        <div>
          {this.renderHeader()}
          {this.renderMainTaskEdit()}
        </div>
        <div className={styles.TaskEditorSubTasksIndentedContainer}>
          {subtaskArray.map(this.renderSubTask)}
          {(disabled !== true) && (
            <div className={styles.TaskEditorFlexibleContainer}>
              <input
                className={styles.TaskEditorFlexibleInput}
                placeholder="A new subtask"
                value=""
                onChange={this.handleNewSubTaskValueChange}
              />
            </div>
          )}
        </div>
        {children}
      </form>
    );
  }
}

const ConnectedTaskEditor = simpleConnect<OwnProps, SubscribedProps>(
  ({ tags }: StoreState): SubscribedProps => ({ tags }),
)(TaskEditor);
export default ConnectedTaskEditor;
