// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NewTask.css';
import ToastUndo from './ToastUndo';
import ClassPicker from './ClassPickerComponent';
import DatePicker from './DatePicker';
import FocusPicker from './FocusPicker';
import { randomId } from '../../util/general-util';
import { fullConnect } from '../../store/react-redux-util';
import type { Task, State as StoreState, SubTask } from '../../store/store-types';
import { addTask as addTaskAction, removeTask as removeTaskAction } from '../../store/actions';
import type { AddNewTaskAction, RemoveTaskAction } from '../../store/action-types';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG_ID } from '../../util/constants';

type OwnProps = {||};
type SubscribedProps = {| +mainTaskArray: Task[]; |};
type ActionProps = {|
  +addTask: (task: Task) => AddNewTaskAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
|}
type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps |};

type DisplayState = {|
  +opened: boolean;
  +tagPickerOpened: boolean;
  +datePickerOpened: boolean;
  +datePicked: boolean;
  +lastDel: number;
  +lastToast: number;
|};
type State = {|
  ...Task;
  ...DisplayState;
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
  subtaskArray: [],
  opened: false,
  tagPickerOpened: false,
  datePickerOpened: false,
  datePicked: false,
  lastDel: -1,
  lastToast: -1,
});

class NewTaskComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = initialState();
    // this.addTask = React.createRef();
    this.addTaskModal = React.createRef();
    this.blockModal = React.createRef();
  }

  /**
   * Focus on the task name, if possible.
   */
  focusTaskName = () => {
    if (this.addTask) {
      this.addTask.focus();
    }
  };

  openNewTask = () => {
    // this.setState({ opened: true });
    this.addTaskModal.current.style.display = 'block';
    this.blockModal.current.style.display = 'block';
    if (this.addTask) {
      this.addTask.placeholder = '';
    }
  };

  closeNewTask = () => {
    // this.setState({ opened: false });
    this.addTaskModal.current.style.display = '';
    this.blockModal.current.style.display = '';
    if (this.addTask) {
      this.addTask.placeholder = PLACEHOLDER_TEXT;
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
      id, name, tag, date, complete, inFocus, subtaskArray, lastToast,
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
      subtaskArray: subtaskArray
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
  };

  handleUndo = (e) => {
    e.stopPropagation();
    const { lastDel, lastToast } = this.state;
    const { mainTaskArray, removeTask } = this.props;
    toast.dismiss(lastToast);
    const taskId = lastDel;
    if (taskId === -1) {
      return;
    }
    const lastTask = mainTaskArray.find(task => task.id === taskId);
    removeTask(taskId);
    this.setState({ ...lastTask, lastDel: -1 });
    this.focusTaskName();
  };

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

  addNewSubTask = (e) => {
    const newSubTaskName = e.target.value;
    if (newSubTaskName === '') {
      return;
    }
    this.setState(({ subtaskArray }: State) => {
      const newSubtask: SubTask = {
        id: subtaskArray.length,
        name: newSubTaskName,
        complete: false,
        inFocus: false,
      };
      return {
        subtaskArray: [...subtaskArray, newSubtask],
      };
    }, () => {
      if (this.subtaskList) {
        const liList = this.subtaskList.getElementsByTagName('LI');
        const lastItem = liList[liList.length - 1];
        lastItem.getElementsByTagName('INPUT')[0].focus();
      }
    });
    e.target.value = '';
  };

  editSubTask = (
    subtaskId: number, doSave: boolean, e: SyntheticEvent<HTMLInputElement>,
  ) => {
    const { subtaskArray } = this.state;
    const newSubtaskArr = subtaskArray.map(el => (
      el.id === subtaskId ? { ...el, name: e.currentTarget.value } : el
    ));
    this.setState(
      { subtaskArray: newSubtaskArr },
      doSave ? this.handleSave : () => {},
    );
  };

  submitSubTask = (subtaskId: number) => (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.editSubTask(subtaskId, true, e);
    }
  };

  deleteSubTask = (subtaskId: number) => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { subtaskArray } = this.state;
    this.setState({ subtaskArray: subtaskArray.filter(el => el.id !== subtaskId) });
  };

  openTagPicker = () => this.setState({ tagPickerOpened: true, datePickerOpened: false });

  openDatePicker = () => this.setState({ tagPickerOpened: false, datePickerOpened: true });

  resetTask = () => {
    const { lastDel, lastToast } = this.state;
    this.setState({ ...initialState(), lastDel, lastToast }, this.focusTaskName);
  };

  addTask: ?HTMLInputElement;
  subtaskList: ?HTMLUListElement;

  render(): Node {
    const {
      name, tag, date, inFocus, subtaskArray,
      opened, tagPickerOpened, datePickerOpened, datePicked,
    } = this.state;
    // const toggleDisplayStyle = opened ? { display: 'block' } : {};
    return (
      <div>
        <div
          onClick={this.closeNewTask}
          role="presentation"
          className={styles.CloseNewTask}
          ref={this.blockModal}
        />
        <form
          className={styles.NewTaskWrap}
          onSubmit={this.handleSave}
          onFocus={this.openNewTask}
        >
          <input
            required
            value={name}
            onChange={this.editTaskName}
            type="text"
            className={styles.NewTaskComponent}
            placeholder={opened ? '' : PLACEHOLDER_TEXT}
            ref={(e) => { this.addTask = e; }}
          />
          <div className={styles.NewTaskActive} ref={this.addTaskModal}>
            <FocusPicker pinned={inFocus} onPinChange={this.togglePin} />
            <ClassPicker
              tag={tag}
              opened={tagPickerOpened}
              onTagChange={this.editTag}
              onPickerOpened={this.openTagPicker}
            />
            <DatePicker
              opened={datePickerOpened}
              date={date}
              datePicked={datePicked}
              onDateChange={this.editDate}
              onPickerOpened={this.openDatePicker}
            />
            <button type="submit" className={styles.SubmitNewTask}>
              <Icon
                name="arrow alternate circle right outline"
                color="black"
                className={styles.CenterIcon}
              />
            </button>
            <div className={styles.NewTaskModal}>
              <ul ref={(e) => { this.subtaskList = e; }}>
                {
                  subtaskArray.map((subtaskObj: SubTask) => (
                    <li key={subtaskObj.name + Math.random()}>
                      <button type="button" onClick={this.deleteSubTask(subtaskObj.id)}>
                        <Icon name="delete" />
                      </button>
                      <input
                        type="text"
                        defaultValue={subtaskObj.name}
                        onBlur={e => this.editSubTask(subtaskObj.id, false, e)}
                        onKeyDown={this.submitSubTask(subtaskObj.id)}
                      />
                    </li>
                  ))
                }
              </ul>
              <Icon name="plus" />
              <input type="text" placeholder="Add a Subtask" onKeyUp={this.addNewSubTask} />
              <button type="button" className={styles.ResetButton} onClick={this.resetTask}>
                Clear
              </button>
            </div>
          </div>
        </form>
        <ToastContainer className={styles.Toast} />
      </div>
    );
  }
}

const ConnectedNewTaskComponent = fullConnect<OwnProps, SubscribedProps, ActionProps>(
  ({ mainTaskArray }: StoreState) => ({ mainTaskArray }),
  { addTask: addTaskAction, removeTask: removeTaskAction },
)(NewTaskComponent);
export default ConnectedNewTaskComponent;
