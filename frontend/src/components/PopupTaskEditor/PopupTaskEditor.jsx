// @flow

import * as React from 'react';
import {
  Header, Input, Icon, Button,
} from 'semantic-ui-react';
import type { Dispatch } from 'redux';
import connect from 'react-redux/es/connect/connect';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import styles from './PopupTaskEditor.css';
import PopupInternalSubTaskEditor from './PopupInternalSubTaskEditor';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  editTask: (task: Task) => dispatch(editTaskAction(task)),
});

type Props = {| ...Task; +editTask: (task: Task) => void |};
type State = {| ...Task |};

class PopupTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, ...task } = props;
    this.state = task;
  }

  editTask(event: any) {
    event.preventDefault();
    const name = event.target.value;
    this.setState((state: State) => ({ ...state, name }));
  }

  editSubTasks(subtaskArray: SubTask[]) {
    this.setState((state: State) => ({ ...state, subtaskArray }));
  }

  submitChanges(event: any) {
    event.preventDefault();
    const { editTask } = this.props;
    editTask(this.state);
  }

  render() {
    const {
      name, id, tag, date, subtaskArray,
    } = this.state;
    return (
      <div id={id}>
        <Header className={styles.PopupTaskEditorFlexibleContainer}>
          <span style={{ marginRight: '0.5em' }}>Main Task: </span>
          <Input
            className={styles.PopupTaskEditorFlexibleInput}
            placeholder="Main Task"
            value={name}
            onChange={event => this.editTask(event)}
          />
          <Icon name="tag" style={{ marginLeft: '0.5em' }} />
          <Icon name="calendar" style={{ marginLeft: '0.5em' }} />
        </Header>
        <PopupInternalSubTaskEditor
          subtaskArray={subtaskArray}
          editSubTasks={arr => this.editSubTasks(arr)}
        />
        <Button onClick={event => this.submitChanges(event)}>Submit</Button>
      </div>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, mapDispatchToProps)(PopupTaskEditor);
export default ConnectedPopupTaskEditor;
