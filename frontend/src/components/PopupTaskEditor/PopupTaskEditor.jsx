// @flow

import * as React from 'react';
import {
  Header, Form, Input, Icon, Modal, Button,
} from 'semantic-ui-react';
import type { Dispatch } from 'redux';
import connect from 'react-redux/es/connect/connect';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import styles from './PopupTaskEditor.css';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  editTask: (task: Task) => dispatch(editTaskAction(task)),
});

type Props = {| ...Task; editTask: (task: Task) => void |};
type State = {| ...Task; newSubTaskValue: string; |};

class PopupTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, ...propsRest } = props;
    this.state = { ...propsRest, newSubTaskValue: '' };
  }

  editTask(name: string) {
    this.setState((state: State) => ({ ...state, name }));
  }

  editSubTask(id: number, name: string) {
    this.setState((state: State) => ({
      ...state,
      subtaskArray: state.subtaskArray
        .map(subTask => (subTask.id === id ? { ...subTask, name } : subTask)),
    }));
  }

  handleNewSubTaskValueChange(event: any) {
    const newSubTaskValue = event.target.value;
    this.setState((state: State) => ({ ...state, newSubTaskValue }));
  }

  handleSubmitForNewSubTask() {
    const createNewSubTask = (name: string) => ({
      name, id: ((10 * new Date()) + Math.floor(10 * Math.random())), complete: false,
    });
    this.setState((state: State) => ({
      ...state,
      subtaskArray: [...state.subtaskArray, createNewSubTask(state.newSubTaskValue)],
      newSubTaskValue: '',
    }));
  }

  submitChanges() {
    const { editTask } = this.props;
    const { newSubTaskValue, ...task } = this.state;
    editTask(task);
  }

  render() {
    const {
      name, id, tag, date, subtaskArray, newSubTaskValue,
    } = this.state;
    const headerElement = (
      <Header className={styles.flexibleContainer}>
        <span style={{ marginRight: '0.5em' }}>Main Task: </span>
        <Input
          className={styles.flexibleInput}
          placeholder="Main Task"
          value={name}
          onChange={event => this.editTask(event.target.value)}
        />
        <Icon name="tag" style={{ marginLeft: '0.5em' }} />
        <Icon name="calendar" style={{ marginLeft: '0.5em' }} />
      </Header>
    );
    const existingSubTasks = subtaskArray.map((subTask: SubTask) => (
      <div key={subTask.id} className={styles.flexibleContainer}>
        <Input
          id={subTask.id}
          className={styles.flexibleInput}
          placeholder="Your Sub-Task"
          value={subTask.name}
          onChange={event => this.editSubTask(subTask.id, event.target.value)}
        />
      </div>
    ));
    const subTasksElement = (
      <Modal.Description>
        <div>Sub-tasks:</div>
        <div>
          {existingSubTasks}
          <Form
            className={styles.flexibleContainer}
            onSubmit={() => this.handleSubmitForNewSubTask()}
          >
            <Form.Input
              className={styles.flexibleInput}
              placeholder="Your New Sub-Task"
              value={newSubTaskValue}
              onChange={event => this.handleNewSubTaskValueChange(event)}
            />
          </Form>
        </div>
      </Modal.Description>
    );
    return (
      <div id={id}>
        {headerElement}
        {subTasksElement}
        <Button onClick={() => this.submitChanges()}>Submit</Button>
      </div>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, mapDispatchToProps)(PopupTaskEditor);
export default ConnectedPopupTaskEditor;
