// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import type { SubTask } from '../../store/store-types';
import styles from './FloatingTaskEditor.css';
import CheckBox from '../UI/CheckBox';

type Props = {|
  +subtaskArray: SubTask[];
  +editSubTasks: (subtaskArray: SubTask[]) => void;
|};

type State = {|
  +subtaskArray: SubTask[];
  +newSubTaskValue: string;
  +autoFocusId: number;
|};

/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
const randomId = (): number => ((10 * new Date()) + Math.floor(1000 * Math.random()));

/**
 * InternalSubTaskFloatingEditor is intended for internal use for FloatingTaskEditor only.
 */
export default class InternalSubTaskFloatingEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { subtaskArray } = props;
    const autoFocusId = subtaskArray.length === 0 ? 0 : subtaskArray.length - 1;
    this.state = { subtaskArray, newSubTaskValue: '', autoFocusId };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { subtaskArray } = this.props;
    if (prevState !== this.state) {
      // do nothing
    } else if (prevProps.subtaskArray === subtaskArray) {
      return;
    }
    const e = this.inputToFocus;
    if (e != null) {
      e.focus();
    }
  }

  inputToFocus: ?HTMLInputElement;

  /**
   * Register the element e at index if it is the autoFocus element.
   * This method ensures that when we are rendering stuff, we choose the right text input to focus.
   *
   * @param {HTMLInputElement} e the DOM element to register.
   * @param {number} index the index of the element.
   */
  registerInputToFocus(e: ?HTMLInputElement, index: number) {
    const { autoFocusId } = this.state;
    if (index !== autoFocusId) {
      return;
    }
    this.inputToFocus = e;
  }

  /**
   * Edit one particular subtask.
   *
   * @param {number} id the id of the subtask.
   * @param {Event} event the event that notifies about the edit and gives the new value of the
   * subtask.
   */
  editSubTask(id: number, event: Event) {
    event.preventDefault();
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const name = event.target.value;
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      const newState = {
        ...state,
        subtaskArray: state.subtaskArray.map((subTask: SubTask) => (
          subTask.id === id ? { ...subTask, name } : subTask
        )),
      };
      editSubTasks(newState.subtaskArray);
      return newState;
    });
  }

  /**
   * Remove one particular subtask.
   *
   * @param {number} id the id of the subtask.
   */
  removeSubTask(id: number) {
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      const newState = {
        ...state,
        subtaskArray: state.subtaskArray.filter((subTask: SubTask) => subTask.id !== id),
      };
      editSubTasks(newState.subtaskArray);
      return newState;
    });
  }

  /**
   * Edit one particular subtask's completion.
   *
   * @param id the id of the subtask.
   */
  editSubTaskComplete(id: number) {
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      const newState = {
        ...state,
        subtaskArray: state.subtaskArray.map((subTask: SubTask) => (
          subTask.id === id ? { ...subTask, complete: !subTask.complete } : subTask
        )),
      };
      editSubTasks(newState.subtaskArray);
      return newState;
    });
  }

  /**
   * Handle a potential switch focus request when the user press some key, which
   * may be ENTER, in which case we want to shift focus to the next input element.
   *
   * @param {KeyboardEvent} event the keyboard event to check.
   * @param {number} currentIndex the current input index.
   */
  switchFocus(event: KeyboardEvent, currentIndex: number) {
    const autoFocusId = currentIndex + 1;
    const inputTarget = event.target;
    if (inputTarget instanceof HTMLInputElement) {
      if (event.key !== 'Enter') {
        this.setState((state: State) => ({ ...state, autoFocusId: currentIndex }));
        return;
      }
      inputTarget.blur();
      const focusInput = this.inputToFocus;
      if (focusInput != null) {
        focusInput.focus();
      }
      this.setState((state: State) => ({ ...state, autoFocusId }));
    }
  }

  /**
   * Update the state when the new line of subtask name changes.
   *
   * @param event the event that notifies about the change and contains the new value.
   */
  handleNewSubTaskValueChange(event: Event) {
    event.preventDefault();
    if (event.target instanceof HTMLInputElement) {
      const newSubTaskValue: string = event.target.value.trim();
      if (newSubTaskValue.length === 0) {
        return;
      }
      const newSubTask: SubTask = {
        name: newSubTaskValue,
        id: randomId(),
        complete: false,
        inFocus: false,
      };
      this.setState((state: State) => ({
        ...state,
        subtaskArray: [...state.subtaskArray, newSubTask],
        newSubTaskValue: '',
        autoFocusId: state.subtaskArray.length,
      }));
    }
  }

  /**
   * Render a subtask.
   *
   * @param {SubTask} subTask one subtask.
   * @param {number} index index of the subtask in the array.
   */
  renderSubTask(subTask: SubTask, index: number): Node {
    const { id, name, complete } = subTask;
    return (
      <div key={id} className={styles.FloatingTaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.FloatingTaskEditorCheckBox}
          checked={complete}
          onChange={() => this.editSubTaskComplete(id)}
        />
        <Input
          ref={e => this.registerInputToFocus(e, index)}
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          focusid={index}
          value={name}
          onKeyDown={event => this.switchFocus(event, index)}
          onChange={event => this.editSubTask(id, event)}
        />
        <Icon name="delete" onClick={() => this.removeSubTask(id)} />
      </div>
    );
  }

  render(): Node {
    const { subtaskArray, newSubTaskValue } = this.state;
    const focusId = subtaskArray.length;
    const existingSubTasks = subtaskArray.map((t: SubTask, i: number) => this.renderSubTask(t, i));
    const newSubTaskEditor = (
      <div className={styles.FloatingTaskEditorFlexibleContainer}>
        <Input
          className={styles.FloatingTaskEditorFlexibleInput}
          ref={e => this.registerInputToFocus(e, focusId)}
          focusid={focusId}
          placeholder="Your New Sub-Task"
          value={newSubTaskValue}
          onChange={event => this.handleNewSubTaskValueChange(event)}
        />
      </div>
    );
    return (
      <div className={styles.FloatingTaskEditorSubTasksIndentedContainer}>
        {existingSubTasks}
        {newSubTaskEditor}
      </div>
    );
  }
}
