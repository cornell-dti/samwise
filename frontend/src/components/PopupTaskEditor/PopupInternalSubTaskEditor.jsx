import * as React from 'react';
import { Form, Input } from 'semantic-ui-react';
import type { SubTask } from '../../store/store-types';
import styles from './PopupTaskEditor.css';

type Props = {|
  subtaskArray: SubTask[];
  editSubTasks: (subtaskArray: SubTask[]) => void;
|};
type State = {|
  subtaskArray: SubTask[];
  newSubTaskValue: string;
|};

/**
 * PopupInternalSubTaskEditor is intended for internal use for PopupTaskEditor only.
 */
export default class PopupInternalSubTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { subtaskArray } = props;
    this.state = { subtaskArray, newSubTaskValue: '' };
  }

  editSubTask(id: number, event: any) {
    event.preventDefault();
    const name = event.target.value;
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      const newState = {
        ...state,
        subtaskArray: state.subtaskArray
          .map(subTask => (subTask.id === id ? { ...subTask, name } : subTask)),
      };
      editSubTasks(newState.subtaskArray);
      return newState;
    });
  }

  handleNewSubTaskValueChange(event: any) {
    event.preventDefault();
    const newSubTaskValue = event.target.value;
    this.setState((state: State) => ({ ...state, newSubTaskValue }));
  }

  handleSubmitForNewSubTask(event: any) {
    event.preventDefault();
    const createNewSubTask = (name: string) => ({
      name, id: ((10 * new Date()) + Math.floor(10 * Math.random())), complete: false,
    });
    const { editSubTasks } = this.props;
    this.setState((state: State) => {
      const newState = {
        subtaskArray: [...state.subtaskArray, createNewSubTask(state.newSubTaskValue)],
        newSubTaskValue: '',
      };
      editSubTasks(newState.subtaskArray);
      return newState;
    });
  }

  render() {
    const { subtaskArray, newSubTaskValue } = this.state;
    const existingSubTasks = subtaskArray.map((subTask: SubTask) => (
      <div key={subTask.id} className={styles.PopupTaskEditorFlexibleContainer}>
        <Input
          id={subTask.id}
          className={styles.PopupTaskEditorFlexibleInput}
          placeholder="Your Sub-Task"
          value={subTask.name}
          onChange={event => this.editSubTask(subTask.id, event)}
        />
      </div>
    ));
    return (
      <div>
        <div>Sub-tasks:</div>
        <div>
          {existingSubTasks}
          <Form
            className={styles.PopupTaskEditorFlexibleContainer}
            onSubmit={event => this.handleSubmitForNewSubTask(event)}
          >
            <Form.Input
              className={styles.PopupTaskEditorFlexibleInput}
              placeholder="Your New Sub-Task"
              value={newSubTaskValue}
              onChange={event => this.handleNewSubTaskValueChange(event)}
            />
          </Form>
        </div>
      </div>
    );
  }
}
