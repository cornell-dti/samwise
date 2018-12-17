// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './NewTask.css';
import ToastUndo from './ToastUndo';
import ClassPicker from './ClassPickerComponent';
import CalPicker from './CalPicker';
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

type State = {|
  ...Task;
  +opened: boolean;
  +tagPickerOpened: boolean;
  +calPickerOpened: boolean;
  +lastDel: number;
  +lastToast: number;
|};

/**
 * The placeholder text in the main task input box.
 * @type {string}
 */
const placeholderText = 'What do you have to do?';
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
  calPickerOpened: false,
  lastDel: -1,
  lastToast: -1,
});

class NewTaskComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = initialState();
    this.addTask = React.createRef();
    this.addTaskModal = React.createRef();
    this.blockModal = React.createRef();
    this.subtaskList = React.createRef();
    this.datePicker = React.createRef();
  }

  openNewTask = () => {
    // this.setState({ opened: true });
    this.addTaskModal.current.style.display = 'block';
    this.blockModal.current.style.display = 'block';
    this.addTask.current.placeholder = '';
  };

  closeNewTask = () => {
    // this.setState({ opened: false });
    this.addTaskModal.current.style.display = '';
    this.blockModal.current.style.display = '';
    this.addTask.current.placeholder = placeholderText;
    this.addTask.current.blur();
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
      opened, tagPickerOpened, calPickerOpened, lastToast, lastDel, ...task
    } = this.state;
    const { addTask } = this.props;
    const {
      id, name, date, subtaskArray,
    } = task;
    if (name === '') {
      return;
    }
    // Add the task to the store.
    addTask({
      ...task,
      subtaskArray: subtaskArray
        .filter(subTask => subTask.name !== '')
        .map((subTask, index) => ({ ...subTask, id: index })),
    });
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
    this.datePicker.current.reset();
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
    this.addTask.current.focus();
  };

  editTaskName = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ name: e.currentTarget.value });
  };

  editTag = (tag: number) => {
    this.setState({ tag, tagPickerOpened: false });
    this.addTask.current.focus();
  };

  editDate = (date: Date) => {
    this.setState({ date, calPickerOpened: false });
    this.addTask.current.focus();
  };

  togglePin = (inFocus: boolean) => {
    this.setState({ inFocus });
    this.addTask.current.focus();
  };

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
      const liList = this.subtaskList.current.getElementsByTagName('LI');
      const lastItem = liList[liList.length - 1];
      lastItem.getElementsByTagName('INPUT')[0].focus();
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

  openTag = () => this.setState({ tagPickerOpened: true, calPickerOpened: false });

  openCal = () => this.setState({ tagPickerOpened: false, calPickerOpened: true });

  resetTask = () => {
    const { lastDel, lastToast } = this.state;
    this.setState({ ...initialState(), lastDel, lastToast });
    this.addTask.current.focus();
  };

  render(): Node {
    const {
      name, tag, inFocus, subtaskArray, opened, tagPickerOpened, calPickerOpened,
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
            value={name}
            onChange={this.editTaskName}
            type="text"
            className={styles.NewTaskComponent}
            placeholder={opened ? '' : placeholderText}
            ref={this.addTask}
            required
          />
          <div className={styles.NewTaskActive} ref={this.addTaskModal}>
            <FocusPicker pinned={inFocus} onPinChange={this.togglePin} />
            <ClassPicker
              tag={tag}
              opened={tagPickerOpened}
              onTagChange={this.editTag}
              onPickerOpened={this.openTag}
            />
            <CalPicker
              ref={this.datePicker}
              opened={calPickerOpened}
              onDateChange={this.editDate}
              onPickerOpened={this.openCal}
            />
            <button type="submit" className={styles.SubmitNewTask}>
              <Icon
                name="arrow alternate circle right outline"
                color="black"
                className={styles.CenterIcon}
              />
            </button>
            <div className={styles.NewTaskModal}>
              <ul ref={this.subtaskList}>
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
