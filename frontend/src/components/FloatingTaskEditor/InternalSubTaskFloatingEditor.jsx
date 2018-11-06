// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Form, Icon, Input } from 'semantic-ui-react';
import type { SubTask } from '../../store/store-types';
import styles from './FloatingTaskEditor.css';
import CheckBox from '../UI/CheckBox';

type Props = {|
  subtaskArray: SubTask[];
  editSubTasks: (subtaskArray: SubTask[]) => void;
|};
type State = {|
  subtaskArray: SubTask[];
  newSubTaskValue: string;
|};

/**
 * InternalSubTaskFloatingEditor is intended for internal use for FloatingTaskEditor only.
 */
export default class InternalSubTaskFloatingEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { subtaskArray } = props;
    this.state = { subtaskArray, newSubTaskValue: '' };
  }

  /**
   * Returns a new subtask array based on the current editor state.
   *
   * @param state the current editor state.
   * @return {SubTask[]} the new subtask array.
   */
  createNewSubtaskArray = (state: State) => (
    [...state.subtaskArray, {
      name: state.newSubTaskValue,
      id: ((10 * new Date()) + Math.floor(1000 * Math.random())),
      complete: false,
      inFocus: false,
    }]);

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
   * Update the state when the new line of subtask name changes.
   *
   * @param event the event that notifies about the change and contains the new value.
   */
  handleNewSubTaskValueChange(event: Event) {
    event.preventDefault();
    if (event.target instanceof HTMLInputElement) {
      const newSubTaskValue = event.target.value;
      this.setState((state: State) => ({ ...state, newSubTaskValue }));
    }
  }

  /**
   * Returns the latest known subtask array in the editor.
   * This method should only be called by the PopupEditor when submit to fetch the new values.
   *
   * @return {SubTask[]} the latest known subtask array in the editor.
   */
  reportLatestSubtaskArray(): SubTask[] {
    const { subtaskArray, newSubTaskValue } = this.state;
    if (!newSubTaskValue.trim()) {
      return subtaskArray;
    }
    return this.createNewSubtaskArray(this.state);
  }

  /**
   * Change the state to account for a new line of subtask.
   *
   * @param event the keyboard event.
   */
  handleSubmitForNewSubTask(event: Event) {
    event.preventDefault();
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      if (!state.newSubTaskValue.trim()) {
        return state;
      }
      const newSubtaskArray = this.createNewSubtaskArray(state);
      editSubTasks(newSubtaskArray);
      return { subtaskArray: newSubtaskArray, newSubTaskValue: '' };
    });
  }

  /**
   * Render a subtask.
   *
   * @param {SubTask} subTask one subtask.
   */
  renderSubTask(subTask: SubTask): Node {
    const { id, name, complete } = subTask;
    return (
      <div key={id} className={styles.FloatingTaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.FloatingTaskEditorCheckBox}
          checked={complete}
          onChange={() => this.editSubTaskComplete(id)}
        />
        <Input
          id={id}
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          value={name}
          onChange={event => this.editSubTask(id, event)}
        />
        <Icon name="delete" onClick={() => this.removeSubTask(id)} />
      </div>
    );
  }

  render(): Node {
    const { subtaskArray, newSubTaskValue } = this.state;
    const existingSubTasks = subtaskArray.map((subTask: SubTask) => this.renderSubTask(subTask));
    const newSubTaskEditor = (
      <Form
        className={styles.FloatingTaskEditorFlexibleContainer}
        onSubmit={event => this.handleSubmitForNewSubTask(event)}
      >
        <Form.Input
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Your New Sub-Task"
          value={newSubTaskValue}
          onChange={event => this.handleNewSubTaskValueChange(event)}
        />
      </Form>
    );
    return (
      <div className={styles.FloatingTaskEditorSubTasksIndentedContainer}>
        {existingSubTasks}
        {newSubTaskEditor}
      </div>
    );
  }
}
