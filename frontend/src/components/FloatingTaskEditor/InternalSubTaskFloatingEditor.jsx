// @flow

import * as React from 'react';
import { Form, Input, Modal } from 'semantic-ui-react';
import type { SubTask } from '../../store/store-types';
import styles from './FloatingTaskEditor.css';

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
   * @param id the id of the new subtask.
   * @param event the event that notifies about the edit and gives the new value of the subtask.
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

  render() {
    const { subtaskArray, newSubTaskValue } = this.state;
    const existingSubTasks = subtaskArray.map((subTask: SubTask) => (
      <div key={subTask.id} className={styles.FloatingTaskEditorFlexibleContainer}>
        <Input
          id={subTask.id}
          className={styles.FloatingTaskEditorFlexiblePadding}
          placeholder="Your Sub-Task"
          value={subTask.name}
          onChange={event => this.editSubTask(subTask.id, event)}
        />
      </div>
    ));
    return (
      <Modal.Description>
        <div>Sub-tasks:</div>
        <div>
          {existingSubTasks}
          <Form
            className={styles.FloatingTaskEditorFlexibleContainer}
            onSubmit={event => this.handleSubmitForNewSubTask(event)}
          >
            <Form.Input
              className={styles.FloatingTaskEditorFlexiblePadding}
              placeholder="Your New Sub-Task"
              value={newSubTaskValue}
              onChange={event => this.handleNewSubTaskValueChange(event)}
            />
          </Form>
        </div>
      </Modal.Description>
    );
  }
}
