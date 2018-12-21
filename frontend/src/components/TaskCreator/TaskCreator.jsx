// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './TaskCreator.css';
import ToastUndo from './ToastUndo';
import TagPicker from './TagPicker';
import DatePicker from './DatePicker';
import FocusPicker from './FocusPicker';
import { randomId } from '../../util/general-util';
import { fullConnect } from '../../store/react-redux-util';
import type { Task, SubTask } from '../../store/store-types';
import { addTask as addTaskAction, removeTask as removeTaskAction } from '../../store/actions';
import type { AddNewTaskAction, RemoveTaskAction } from '../../store/action-types';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG_ID } from '../../util/tag-util';

type OwnProps = {||};
type SubscribedProps = {| +tasks: Task[]; |};
type ActionProps = {|
  +addTask: (task: Task) => AddNewTaskAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
|}
type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps |};

type State = {|
  ...Task;
  +opened: boolean;
  +tagPickerOpened: boolean;
  +datePickerOpened: boolean;
  +datePicked: boolean;
  +needToSwitchFocus: boolean;
  +lastDel: number;
  +lastToast: number;
|};

/**
 * The placeholder text in the main task input box.
 * @type {string}
 */
const PLACEHOLDER_TEXT = 'What do you have to do?';
/**
 * Generate the initial state.
 * @return {State}
 */
const initialState = (): State => ({
  id: randomId(),
  name: '',
  tag: NONE_TAG_ID, // the id of the None tag.
  date: new Date(),
  complete: false,
  inFocus: false,
  subtasks: [],
  opened: false,
  tagPickerOpened: false,
  datePickerOpened: false,
  datePicked: false,
  needToSwitchFocus: false,
  lastDel: -1,
  lastToast: -1,
});

class TaskCreator extends React.PureComponent<Props, State> {
  state: State = initialState();

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Openers & Closers
   * --------------------------------------------------------------------------------
   */

  /**
   * Open the new task editor.
   */
  openNewTask = () => this.setState({ opened: true });

  /**
   * Close (collapse) the new task editor.
   */
  closeNewTask = () => this.setState({ opened: false });

  /**
   * Open the tag picker and close the date picker.
   */
  openTagPicker = () => this.setState({ tagPickerOpened: true, datePickerOpened: false });

  /**
   * Open the date picker and close the tag picker.
   */
  openDatePicker = () => this.setState({ tagPickerOpened: false, datePickerOpened: true });

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Manager functions when finished editing.
   * --------------------------------------------------------------------------------
   */

  /**
   * Focus on the task name, if possible.
   */
  focusTaskName = () => {
    if (this.addTask) {
      this.addTask.focus();
    }
  };

  /**
   * Handle on potential save.
   *
   * @param e the event that signals a potential save action.
   */
  handleSave = (e?: SyntheticEvent<HTMLElement>) => {
    if (e != null) {
      e.preventDefault();
    }
    const {
      id, name, tag, date, complete, inFocus, subtasks, lastToast,
    } = this.state;
    const { addTask } = this.props;
    if (name === '') {
      return;
    }
    const newTask = {
      id,
      name,
      tag,
      date,
      complete,
      inFocus,
      subtasks: subtasks
        .filter(subTask => subTask.name !== '')
        .map((subTask, index) => ({ ...subTask, id: index })),
    };
    // Add the task to the store.
    addTask(newTask);
    // Emit a new toast.
    const taskMsg = `Added "${name}" (${date2String(date)})`;
    toast.dismiss(lastToast);
    const newToast = toast.success(
      <ToastUndo dispText={taskMsg} changeCallback={this.handleUndo} />, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      },
    );
    // Reset the state.
    this.setState({ ...initialState(), lastDel: id, lastToast: newToast });
    this.closeNewTask();
    if (this.addTask) {
      this.addTask.blur();
    }
  };

  /**
   * Handle on undoing an operation.
   *
   * @param {SyntheticMouseEvent<HTMLButtonElement>} e the event signaling an undo.
   */
  handleUndo = (e: SyntheticMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { lastDel, lastToast } = this.state;
    const { tasks, removeTask } = this.props;
    toast.dismiss(lastToast);
    if (lastDel === -1) {
      return;
    }
    const lastTask = tasks.find(task => task.id === lastDel);
    removeTask(lastDel);
    this.setState({ ...lastTask, lastDel: -1 });
    this.focusTaskName();
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Various Editors
   * --------------------------------------------------------------------------------
   */

  /**
   * Edit the task name.
   *
   * @param e the event that contains the new task name.
   */
  editTaskName = (e: SyntheticEvent<HTMLInputElement>) => this.setState(
    { name: e.currentTarget.value },
    this.focusTaskName,
  );

  /**
   * Edit the tag.
   *
   * @param {number} tag the new tag.
   */
  editTag = (tag: number) => this.setState({ tag, tagPickerOpened: false }, this.focusTaskName);

  /**
   * Edit the date.
   *
   * @param {Date} date the new date.
   */
  editDate = (date: Date) => this.setState(
    { date, datePickerOpened: false, datePicked: true },
    this.focusTaskName,
  );

  /**
   * Toggle the pin status.
   * @param {boolean} inFocus the new in-focus status.
   */
  togglePin = (inFocus: boolean) => this.setState({ inFocus }, this.focusTaskName);

  /**
   * Add a new subtask.
   *
   * @param e the event that contains the new name for new sub-task.
   */
  addNewSubTask = (e: SyntheticEvent<HTMLInputElement>) => {
    const newSubTaskName = e.currentTarget.value;
    if (newSubTaskName === '') {
      return;
    }
    this.setState(({ subtasks }: State) => ({
      subtasks: [...subtasks, {
        id: subtasks.length,
        name: newSubTaskName,
        complete: false,
        inFocus: false,
      }],
      needToSwitchFocus: true,
    }));
  };

  /**
   * Edit a subtask.
   *
   * @param {number} subtaskId id of the subtask to edit.
   * @return {Function<SyntheticEvent<HTMLInputElement>, void>} the event handler.
   */
  editSubTask = (subtaskId: number) => (e: SyntheticEvent<HTMLInputElement>) => {
    const name = e.currentTarget.value;
    const { subtasks } = this.state;
    this.setState({
      subtasks: subtasks.map(s => (s.id === subtaskId ? { ...s, name } : s)),
    });
  };

  /**
   * Potentially submit a subtask.
   *
   * @param {SyntheticKeyboardEvent<HTMLInputElement>} e the keyboard event.
   */
  submitSubTask = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.handleSave();
    }
  };

  /**
   * Delete a subtask.
   *
   * @param {number} subtaskId id of the subtask to delete.
   * @return {Function<SyntheticEvent<HTMLInputElement>, void>} the event handler.
   */
  deleteSubTask = (subtaskId: number) => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.setState(({ subtasks }: State) => ({
      subtasks: subtasks.filter(el => el.id !== subtaskId),
    }));
  };

  /**
   * Reset the task.
   */
  resetTask = () => {
    const { lastDel, lastToast } = this.state;
    this.setState({ ...initialState(), lastDel, lastToast }, this.focusTaskName);
  };

  addTask: ?HTMLInputElement;

  /**
   * Renders the editor for all the other info except main task name.
   *
   * @return {Node} the rendered other info editor.
   */
  renderOtherInfoEditor(): Node {
    const { opened } = this.state;
    if (!opened) {
      return null;
    }
    const {
      tag, date, inFocus, subtasks,
      tagPickerOpened, datePickerOpened, datePicked, needToSwitchFocus,
    } = this.state;
    const existingSubTaskEditor = ({ id, name }: SubTask, i: number, arr: SubTask[]) => {
      const refHandler = (inputElementRef) => {
        if (i === arr.length - 1 && needToSwitchFocus && inputElementRef != null) {
          inputElementRef.focus();
          this.setState({ needToSwitchFocus: false });
        }
      };
      return (
        <li key={id}>
          <button type="button" tabIndex={-1} onClick={this.deleteSubTask(id)}>
            <Icon name="delete" />
          </button>
          <input
            type="text"
            ref={refHandler}
            value={name}
            onChange={this.editSubTask(id)}
            onKeyDown={this.submitSubTask}
          />
        </li>
      );
    };
    return (
      <div className={styles.NewTaskActive}>
        <FocusPicker pinned={inFocus} onPinChange={this.togglePin} />
        <TagPicker
          tag={tag}
          opened={tagPickerOpened}
          onTagChange={this.editTag}
          onPickerOpened={this.openTagPicker}
        />
        <DatePicker
          date={date}
          opened={datePickerOpened}
          datePicked={datePicked}
          onDateChange={this.editDate}
          onPickerOpened={this.openDatePicker}
        />
        <button tabIndex={-1} type="submit" className={styles.SubmitNewTask}>
          <Icon name="arrow alternate circle right outline" color="black" />
        </button>
        <div className={styles.NewTaskModal}>
          <ul>{subtasks.map(existingSubTaskEditor)}</ul>
          <Icon name="plus" />
          <input type="text" placeholder="Add a Subtask" value="" onChange={this.addNewSubTask} />
          <button type="button" className={styles.ResetButton} onClick={this.resetTask}>
            Clear
          </button>
        </div>
      </div>
    );
  }

  render(): Node {
    const { name, opened } = this.state;
    const toggleDisplayStyle = opened ? {} : { display: 'none' };
    // Click this component, new task component closes.
    const newTaskCloser = (
      <div
        onClick={this.closeNewTask}
        role="presentation"
        className={styles.CloseNewTask}
        style={toggleDisplayStyle}
      />
    );
    const mainTaskNameEditor = (
      <input
        required
        type="text"
        value={name}
        onChange={this.editTaskName}
        className={styles.NewTaskComponent}
        placeholder={opened ? '' : PLACEHOLDER_TEXT}
        ref={(e) => { this.addTask = e; }}
      />
    );
    return (
      <div>
        {newTaskCloser}
        <form className={styles.NewTaskWrap} onSubmit={this.handleSave} onFocus={this.openNewTask}>
          {mainTaskNameEditor}
          {this.renderOtherInfoEditor()}
        </form>
        <ToastContainer className={styles.Toast} />
      </div>
    );
  }
}

const ConnectedTaskCreator = fullConnect<OwnProps, SubscribedProps, ActionProps>(
  ({ tasks }) => ({ tasks }),
  { addTask: addTaskAction, removeTask: removeTaskAction },
)(TaskCreator);
export default ConnectedTaskCreator;

// TODO
