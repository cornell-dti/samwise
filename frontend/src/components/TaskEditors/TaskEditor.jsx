// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type {
  Tag, State as StoreState, SubTask, Task,
} from '../../store/store-types';
import ClassPicker from '../ClassPicker/ClassPicker';
import CheckBox from '../UI/CheckBox';
import type { SimpleMainTask } from './task-editors-types';
import styles from './TaskEditor.css';
import { fullConnect } from '../../store/react-redux-util';
import { getNameByTagId, getColorByTagId } from '../../util/tag-util';
import type { RemoveTaskAction } from '../../store/action-types';
import { removeTask as removeTaskAction } from '../../store/actions';
import { randomId } from '../../util/general-util';

type OwnProps = {|
  +initialTask: Task; // The initial task to edit, as a starting point.
  isReadOnly?: boolean; // whether the editor is read-only, which defaults to false.
  +autoSave: boolean; // whether to auto-save changes
  +onSave: (Task) => void; // called when the task is saved, either automatically or save by user.
  className?: string;
  onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  refFunction?: (HTMLElement | null) => void; // used to get the div DOM element.
|};
type SubscribedProps = {| +tags: Tag[]; |};
type ActionProps = {|
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
|};
type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps |};

type State = {|
  ...SimpleMainTask;
  +subtaskArray: SubTask[];
  +backgroundColor: string;
  +doesShowTagEditor: boolean;
  +doesShowCalendarEditor: boolean;
|};

const mapStateToProps = ({ tags }: StoreState): SubscribedProps => ({ tags });

/**
 * The component of an standalone task editor. It is designed to be wrapped inside another
 * component to extend its functionality.
 * You can read the docs for props above.
 */
class TaskEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { initialTask, tags } = props;
    this.state = {
      ...initialTask,
      backgroundColor: getColorByTagId(tags, initialTask.tag),
      doesShowTagEditor: false,
      doesShowCalendarEditor: false,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // This methods ensure that the stuff inside the editor is always the latest from store.
    // Since we implement task in an immutable data structure, a shallow equality comparison is
    // enough.
    const { initialTask, tags } = this.props;
    if (initialTask !== nextProps.initialTask || tags !== nextProps.tags) {
      const nextInitialTask = nextProps.initialTask;
      const backgroundColor = getColorByTagId(nextProps.tags, nextInitialTask.tag);
      this.setState({ ...nextInitialTask, backgroundColor });
    }
  }

  /**
   * Report whether the task editor is read only.
   *
   * @return {boolean} whether the task editor is read only.
   */
  isReadOnly = (): boolean => {
    const { isReadOnly } = this.props;
    return isReadOnly != null && isReadOnly;
  };

  /**
   * Check whether a task has a good format.
   *
   * @param {Task} task the task to check.
   * @return {boolean} whether the task has a good format.
   */
  taskIsGood = (task: Task): boolean => task.name.trim().length > 0;

  /**
   * Filter the task without all the empty subtasks.
   *
   * @param {Task} task the task to filter.
   * @return {Task} the filtered task.
   */
  filterEmptySubTasks = (task: Task): Task => ({
    ...task, subtaskArray: task.subtaskArray.filter(t => t.name.trim().length > 0),
  });

  /**
   * The auto save handler.
   */
  autoSave = (): void => {
    const { autoSave } = this.props;
    if (autoSave) {
      this.submitChanges();
    }
  };

  /**
   * Submit all the changes when clicking submit.
   *
   * @param event the event that notifies about clicking 'submit'.
   */
  submitChanges = (event: ?Event = null): void => {
    if (event != null) {
      event.preventDefault();
    }
    const {
      backgroundColor, doesShowTagEditor, doesShowCalendarEditor, ...task
    } = this.state;
    if (!this.taskIsGood(task)) {
      return;
    }
    const { onSave } = this.props;
    onSave(this.filterEmptySubTasks(task));
  };

  /*
   * --------------------------------------------------------------------------------
   * Part ?: Toggle Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Toggle the editor for the tag of the task.
   */
  toggleTagEditor = (): void => {
    this.setState((state: State) => ({
      doesShowTagEditor: !state.doesShowTagEditor, doesShowCalendarEditor: false,
    }));
  };

  /**
   * Toggle the editor of the deadline of the task.
   */
  toggleDateEditor = (): void => {
    this.setState((state: State) => ({
      doesShowTagEditor: false, doesShowCalendarEditor: !state.doesShowCalendarEditor,
    }));
  };

  /*
   * --------------------------------------------------------------------------------
   * Part ?: Editor Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Change the name of the task.
   *
   * @param {*} event the event to notify the name change.
   */
  editTaskName = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    this.setState({ name }, this.autoSave);
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = (): void => {
    const { complete } = this.state;
    this.setState({ complete: !complete }, this.autoSave);
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = (): void => {
    const { inFocus } = this.state;
    this.setState({ inFocus: !inFocus }, this.autoSave);
  };

  /**
   * Edit the tag of the task.
   *
   * @param {number} tag the new tag id.
   */
  editTaskTag = (tag: number): void => {
    const { tags } = this.props;
    this.setState({
      tag,
      backgroundColor: getColorByTagId(tags, tag),
      doesShowTagEditor: false,
    }, this.autoSave);
  };

  /**
   * Edit the new date of the task.
   *
   * @param {string} dateString the new date in string.
   */
  editTaskDate = (dateString: string): void => {
    this.setState({
      doesShowCalendarEditor: false, date: new Date(dateString),
    }, this.autoSave);
  };

  /**
   * Remove the task.
   */
  removeTask = (): void => {
    const { removeTask } = this.props;
    const { id } = this.state;
    removeTask(id, true);
  };

  /**
   * Edit one particular subtask.
   *
   * @param {number} id the id of the subtask.
   * @return {function(Event): void} the function to handle a edit subtask event that notifies
   * about the edit and gives the new value of the subtask.
   */
  editSubTask = (id: number) => (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    const { subtaskArray } = this.state;
    this.setState({
      subtaskArray: subtaskArray.map((subTask: SubTask) => (
        subTask.id === id ? { ...subTask, name } : subTask
      )),
    }, this.autoSave);
  };

  /**
   * Remove one particular subtask.
   *
   * @param {number} id the id of the subtask.
   * @return {function(): void} the remove subtask event handler.
   */
  removeSubTask = (id: number) => (): void => {
    const { subtaskArray } = this.state;
    this.setState({
      subtaskArray: subtaskArray.filter((subTask: SubTask) => subTask.id !== id),
    }, this.autoSave);
  };

  /**
   * Edit one particular subtask's completion.
   *
   * @param {number} id the id of the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskComplete = (id: number) => (): void => {
    const { subtaskArray } = this.state;
    this.setState({
      subtaskArray: subtaskArray.map((subTask: SubTask) => (
        subTask.id === id ? { ...subTask, complete: !subTask.complete } : subTask
      )),
    }, this.autoSave);
  };

  /**
   * Edit one particular subtask's in focus status.
   *
   * @param {number} id the id of the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskInFocus = (id: number) => (): void => {
    const { subtaskArray } = this.state;
    this.setState({
      subtaskArray: subtaskArray.map((subTask: SubTask) => (
        subTask.id === id ? { ...subTask, inFocus: !subTask.inFocus } : subTask
      )),
    }, this.autoSave);
  };

  /**
   * Update the state to contain the given latest edited subtask array.
   *
   * @param subtaskArray the latest edited subtask array.
   */
  editSubTasks = (subtaskArray: SubTask[]): void => {
    this.setState({ subtaskArray }, this.autoSave);
  };

  /**
   * Update the state when the new line of subtask name changes.
   *
   * @param event the event that notifies about the change and contains the new value.
   */
  handleNewSubTaskValueChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
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
    const { subtaskArray } = this.state;
    this.setState({ subtaskArray: [...subtaskArray, newSubTask] }, this.autoSave);
  };

  /*
   * --------------------------------------------------------------------------------
   * Part ?: Render Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Return the rendered header element.
   *
   * @return {Node} the rendered header node.
   */
  renderHeader = (): Node => {
    const { tags } = this.props;
    const {
      tag, date, doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const headerClassNames = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
    const tagPickerElementOpt = doesShowTagEditor && (
      <div className={styles.TaskEditorTagEditor}>
        <ClassPicker onTagChange={this.editTaskTag} />
      </div>
    );
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.TaskEditorCalendar}
        minDate={new Date()}
        onChange={this.editTaskDate}
      />
    );
    return (
      <div className={headerClassNames}>
        <button type="button" className={styles.TaskEditorTag} onClick={this.toggleTagEditor}>
          {getNameByTagId(tags, tag)}
        </button>
        {tagPickerElementOpt}
        <span className={styles.TaskEditorFlexiblePadding} />
        <Icon
          name="calendar"
          className={styles.TaskEditorIconButton}
          onClick={this.toggleDateEditor}
        />
        <span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>
        {calendarElementOpt}
      </div>
    );
  };

  /**
   * Return the rendered main task text editor element.
   *
   * @return {Node} the rendered main task edit node.
   */
  renderMainTaskEdit = (): Node => {
    const { name, complete, inFocus } = this.state;
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
        <Icon className={styles.TaskEditorIcon} name="delete" onClick={this.removeTask} />
      </div>
    );
  };

  /**
   * Render a subtask.
   *
   * @param {SubTask} subTask one subtask.
   * @return {Node} the rendered subtask.
   */
  renderSubTask = (subTask: SubTask): Node => {
    const {
      id, name, complete, inFocus,
    } = subTask;
    return (
      <div key={id} className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete}
          onChange={this.editSubTaskComplete(id)}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          value={name}
          onChange={this.editSubTask(id)}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editSubTaskInFocus(id)}
        />
        <Icon className={styles.TaskEditorIcon} name="delete" onClick={this.removeSubTask(id)} />
      </div>
    );
  };

  /**
   * Return the rendered main task text editor element.
   *
   * @return {Node} the rendered main task edit node.
   */
  renderNewSubTaskEditor = (): Node => (
    !this.isReadOnly() && (
      <div className={styles.TaskEditorFlexibleContainer}>
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="A new subtask"
          value=""
          onChange={this.handleNewSubTaskValueChange}
        />
      </div>
    )
  );

  /**
   * Render the manual submit button component.
   *
   * @return {Node} the manual submit button component.
   */
  renderManualSubmitComponent = (): Node => (
    <div className={styles.TaskEditorSubmitButtonRow}>
      <span className={styles.TaskEditorFlexiblePadding} />
      <div
        className={styles.TaskEditorSaveButton}
        role="button"
        tabIndex={0}
        onClick={this.submitChanges}
        onKeyDown={this.submitChanges}
      >
        <span className={styles.TaskEditorSaveButtonText}>Save</span>
      </div>
    </div>
  );

  render(): Node {
    const {
      autoSave, className, onFocus, onBlur, refFunction,
    } = this.props;
    const { backgroundColor, subtaskArray } = this.state;
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
          {this.renderNewSubTaskEditor()}
        </div>
        {!autoSave && this.renderManualSubmitComponent()}
      </form>
    );
  }
}

const ConnectedTaskEditor = fullConnect<OwnProps, SubscribedProps, ActionProps>(
  mapStateToProps,
  { removeTask: removeTaskAction },
)(TaskEditor);
export default ConnectedTaskEditor;
