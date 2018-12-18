// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type {
  Tag, State as StoreState, SubTask, Task, MainTask, PartialSubTask,
} from '../../store/store-types';
import ClassPicker from '../ClassPicker/ClassPicker';
import CheckBox from '../UI/CheckBox';
import type { SimpleMainTask } from './task-editors-types';
import styles from './TaskEditor.css';
import { fullConnect } from '../../store/react-redux-util';
import { getNameByTagId, getColorByTagId } from '../../util/tag-util';
import type {
  EditMainTaskAction, EditSubTaskAction, RemoveTaskAction,
} from '../../store/action-types';
import {
  editMainTask as editMainTaskAction,
  editSubTask as editSubTaskAction,
  removeTask as removeTaskAction,
} from '../../store/actions';
import { randomId } from '../../util/general-util';
import { replaceSubTask } from '../../util/task-util';

type OwnProps = {|
  +initialTask: Task; // The initial task to edit, as a starting point.
  isReadOnly?: boolean; // whether the editor is read-only, which defaults to false.
  +saveImmediately: boolean; // whether to save immediately.
  +onSave: (Task) => void; // called when the task is saved, either automatically or save by user.
  className?: string;
  onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  refFunction?: (HTMLElement | null) => void; // used to get the div DOM element.
|};
type SubscribedProps = {| +tags: Tag[]; |};
type ActionProps = {|
  +editMainTask: (taskId: number, partialMainTask: $Shape<MainTask>) => EditMainTaskAction;
  +editSubTask: (
    taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
  ) => EditSubTaskAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
|};
type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps |};

type State = {|
  ...SimpleMainTask;
  +subtaskArray: SubTask[];
  +backgroundColor: string;
  +doesShowTagEditor: boolean;
  +doesShowCalendarEditor: boolean;
  +needToSwitchFocus: boolean;
|};

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
      needToSwitchFocus: false,
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
    const { saveImmediately } = this.props;
    if (saveImmediately) {
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
      backgroundColor, doesShowTagEditor, doesShowCalendarEditor, needToSwitchFocus,
      ...task
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
   * @param {SyntheticEvent<HTMLInputElement>} event the event to notify the name change.
   */
  editTaskName = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editMainTask } = this.props;
      const { id } = this.state;
      editMainTask(id, { name });
    } else {
      this.setState({ name });
    }
  };

  /**
   * Edit the tag of the task.
   *
   * @param {number} tag the new tag id.
   */
  editTaskTag = (tag: number): void => {
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editMainTask } = this.props;
      const { id } = this.state;
      editMainTask(id, { tag });
      this.setState({ doesShowTagEditor: false });
    } else {
      const { tags } = this.props;
      this.setState({
        tag,
        backgroundColor: getColorByTagId(tags, tag),
        doesShowTagEditor: false,
      });
    }
  };

  /**
   * Edit the new date of the task.
   *
   * @param {string} dateString the new date in string.
   */
  editTaskDate = (dateString: string): void => {
    const { saveImmediately } = this.props;
    const date = new Date(dateString);
    if (saveImmediately) {
      const { editMainTask } = this.props;
      const { id } = this.state;
      editMainTask(id, { date });
      this.setState({ doesShowCalendarEditor: false });
    } else {
      this.setState({ doesShowCalendarEditor: false, date });
    }
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = () => {
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editMainTask } = this.props;
      const { id, complete } = this.state;
      editMainTask(id, { complete: !complete });
    } else {
      this.setState(({ complete }: State) => ({ complete: !complete }));
    }
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = () => {
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editMainTask } = this.props;
      const { id, inFocus } = this.state;
      editMainTask(id, { inFocus: !inFocus });
    } else {
      this.setState(({ inFocus }: State) => ({ inFocus: !inFocus }));
    }
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
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editSubTask } = this.props;
      const { id } = this.state;
      editSubTask(id, subtaskId, { name });
    } else {
      this.setState(({ subtaskArray }: State) => ({
        subtaskArray: replaceSubTask(subtaskArray, subtaskId, s => ({ ...s, name })),
      }));
    }
  };

  /**
   * Edit one particular subtask's completion.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskComplete = (subTask: SubTask) => (): void => {
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editSubTask } = this.props;
      const { id } = this.state;
      editSubTask(id, subTask.id, { complete: !subTask.complete });
    } else {
      this.setState(({ subtaskArray }: State) => ({
        subtaskArray: replaceSubTask(
          subtaskArray, subTask.id, s => ({ ...s, complete: !s.complete }),
        ),
      }));
    }
  };

  /**
   * Edit one particular subtask's in focus status.
   *
   * @param {SubTask} subTask the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskInFocus = (subTask: SubTask) => (): void => {
    const { saveImmediately } = this.props;
    if (saveImmediately) {
      const { editSubTask } = this.props;
      const { id } = this.state;
      editSubTask(id, subTask.id, { inFocus: !subTask.inFocus });
    } else {
      this.setState(({ subtaskArray }: State) => ({
        subtaskArray: replaceSubTask(
          subtaskArray, subTask.id, s => ({ ...s, inFocus: !s.inFocus }),
        ),
      }));
    }
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
   * Update the state to contain the given latest edited subtask array.
   *
   * @param {SubTask[]} subtaskArray the latest edited subtask array.
   */
  editSubTasks = (subtaskArray: SubTask[]): void => {
    this.setState({ subtaskArray }, this.autoSave);
  };

  /**
   * Update the state when the new line of subtask name changes.
   *
   * @param {SyntheticEvent<HTMLInputElement>} event the event that notifies about the change and
   * contains the new value.
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
    this.setState({
      subtaskArray: [...subtaskArray, newSubTask],
      needToSwitchFocus: true,
    }, this.autoSave);
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
   * @param {number} index index of the subtask.
   * @param {SubTask[]} array the entire subtask array.
   * @return {Node} the rendered subtask.
   */
  renderSubTask = (subTask: SubTask, index: number, array: SubTask[]): Node => {
    const {
      id, name, complete, inFocus,
    } = subTask;
    const { needToSwitchFocus } = this.state;
    const refHandler = (inputElementRef) => {
      if (index === array.length - 1 && needToSwitchFocus && inputElementRef != null) {
        inputElementRef.focus();
        this.setState({ needToSwitchFocus: false });
      }
    };
    return (
      <div key={id} className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete}
          onChange={this.editSubTaskComplete(subTask)}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          value={name}
          ref={refHandler}
          onChange={this.editSubTaskName(id)}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editSubTaskInFocus(subTask)}
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
        role="presentation"
        className={styles.TaskEditorSaveButton}
        onClick={this.submitChanges}
        onKeyDown={this.submitChanges}
      >
        <span className={styles.TaskEditorSaveButtonText}>Save</span>
      </div>
    </div>
  );

  render(): Node {
    const {
      saveImmediately, className, onFocus, onBlur, refFunction,
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
        {!saveImmediately && this.renderManualSubmitComponent()}
      </form>
    );
  }
}

const ConnectedTaskEditor = fullConnect<OwnProps, SubscribedProps, ActionProps>(
  ({ tags }: StoreState): SubscribedProps => ({ tags }),
  {
    editMainTask: editMainTaskAction,
    editSubTask: editSubTaskAction,
    removeTask: removeTaskAction,
  },
)(TaskEditor);
export default ConnectedTaskEditor;
