// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import type { SubTask } from '../../store/store-types';
import styles from './FloatingTaskEditor.css';
import CheckBox from '../UI/CheckBox';

type Props = {|
  +subtaskArray: SubTask[];
  +focused: boolean;
  +editSubTasks: (subtaskArray: SubTask[]) => void;
|};

type State = {| +autoFocusId: number; |};

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
    this.state = { autoFocusId: 0 };
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Component Lifecycle & Focus Management Methods
   * --------------------------------------------------------------------------------
   */

  componentDidMount() {
    this.handlePotentialFocusChange();
  }

  componentDidUpdate(prevProps: Props) {
    this.handlePotentialFocusChange();
    const { focused } = this.props;
    if (focused !== prevProps.focused) {
      // recently shifted focus
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ autoFocusId: 0 });
    }
  }

  inputToFocus: ?HTMLInputElement;

  /**
   * Handle a potential focus change when the user switch between inputs.
   */
  handlePotentialFocusChange() {
    const { focused } = this.props;
    const e = this.inputToFocus;
    if (e != null && focused) {
      e.focus();
    }
  }

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
    this.handlePotentialFocusChange();
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
      } else {
        inputTarget.blur();
        const focusInput = this.inputToFocus;
        if (focusInput != null) {
          focusInput.focus();
        }
        this.setState((state: State) => ({ ...state, autoFocusId }));
      }
    }
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Editor Methods
   * --------------------------------------------------------------------------------
   */

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
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.map((subTask: SubTask) => (
      subTask.id === id ? { ...subTask, name } : subTask
    )));
  }

  /**
   * Remove one particular subtask.
   *
   * @param {number} id the id of the subtask.
   */
  removeSubTask(id: number) {
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.filter((subTask: SubTask) => subTask.id !== id));
  }

  /**
   * Edit one particular subtask's completion.
   *
   * @param id the id of the subtask.
   */
  editSubTaskComplete(id: number) {
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.map((subTask: SubTask) => (
      subTask.id === id ? { ...subTask, complete: !subTask.complete } : subTask
    )));
  }

  /**
   * Update the state when the new line of subtask name changes.
   *
   * @param event the event that notifies about the change and contains the new value.
   */
  handleNewSubTaskValueChange(event: SyntheticEvent<HTMLInputElement>) {
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
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks([...subtaskArray, newSubTask]);
    this.setState((state: State) => ({
      ...state,
      autoFocusId: subtaskArray.length,
    }));
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Render Methods
   * --------------------------------------------------------------------------------
   */

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
    const { subtaskArray } = this.props;
    const existingSubTasks = subtaskArray.map((t: SubTask, i: number) => this.renderSubTask(t, i));
    const focusId = subtaskArray.length;
    const newSubTaskEditor = (
      <div className={styles.FloatingTaskEditorFlexibleContainer}>
        <Input
          className={styles.FloatingTaskEditorFlexibleInput}
          ref={e => this.registerInputToFocus(e, focusId)}
          focusid={focusId}
          placeholder="Your New Sub-Task"
          value=""
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
