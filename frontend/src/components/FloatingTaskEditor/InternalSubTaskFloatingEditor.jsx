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

  /**
   * Handle a potential focus change when the user switch between inputs.
   */
  handlePotentialFocusChange = (): void => {
    const { focused } = this.props;
    const e = this.inputToFocus;
    if (e != null && focused) {
      e.focus();
    }
  };

  /**
   * Register the element e at index if it is the autoFocus element.
   *
   * @param {number} index the index of the element.
   * @return {function(?HTMLInputElement): void} the function to handle a ref registration.
   */
  registerInputToFocus = (index: number) => (e: ?HTMLInputElement): void => {
    const { autoFocusId } = this.state;
    if (index !== autoFocusId) {
      return;
    }
    this.inputToFocus = e;
    this.handlePotentialFocusChange();
  };

  /**
   * Handle a potential switch focus request when the user press some key, which
   * may be ENTER, in which case we want to shift focus to the next input element.
   *
   * @param {number} currentIndex the current input index.
   * @return {function(KeyboardEvent): void} the function to handle the keyboard event to switch
   * focus.
   */
  switchFocus = (currentIndex: number) => (event: KeyboardEvent): void => {
    const autoFocusId = currentIndex + 1;
    const inputTarget = event.target;
    if (inputTarget instanceof HTMLInputElement) {
      if (event.key !== 'Enter' && event.key !== 'Tab') {
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
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Editor Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Edit one particular subtask.
   *
   * @param {number} id the id of the subtask.
   * @return {function(Event): void} the function to handle a edit subtask event that notifies
   * about the edit and gives the new value of the subtask.
   */
  editSubTask = (id: number) => (event: Event): void => {
    event.preventDefault();
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const name = event.target.value;
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.map((subTask: SubTask) => (
      subTask.id === id ? { ...subTask, name } : subTask
    )));
  };

  /**
   * Remove one particular subtask.
   *
   * @param {number} id the id of the subtask.
   * @return {function(): void} the remove subtask event handler.
   */
  removeSubTask = (id: number) => (): void => {
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.filter((subTask: SubTask) => subTask.id !== id));
  };

  /**
   * Edit one particular subtask's completion.
   *
   * @param {number} id the id of the subtask.
   * @return {function(): void} the edit completion event handler.
   */
  editSubTaskComplete = (id: number) => (): void => {
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks(subtaskArray.map((subTask: SubTask) => (
      subTask.id === id ? { ...subTask, complete: !subTask.complete } : subTask
    )));
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
    const { subtaskArray, editSubTasks } = this.props;
    editSubTasks([...subtaskArray, newSubTask]);
    this.setState((state: State) => ({
      ...state,
      autoFocusId: subtaskArray.length,
    }));
  };

  /**
   * The input to focus. The value will be dynamically changed when user press ENTER.
   */
  inputToFocus: ?HTMLInputElement;

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
          onChange={this.editSubTaskComplete(id)}
        />
        <Input
          ref={this.registerInputToFocus(index)}
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          focusid={index}
          value={name}
          onKeyDown={this.switchFocus(index)}
          onChange={this.editSubTask(id)}
        />
        <Icon name="delete" onClick={this.removeSubTask(id)} />
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
          ref={this.registerInputToFocus(focusId)}
          placeholder="Your New Sub-Task"
          value=""
          onChange={this.handleNewSubTaskValueChange}
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
