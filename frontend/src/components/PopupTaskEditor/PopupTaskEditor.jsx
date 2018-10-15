// @flow

import * as React from 'react';
import {
  Header, Input, Icon, Button, Modal,
} from 'semantic-ui-react';
import Calendar from 'react-calendar';
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
type State = {| ...Task; doesShowCalendarEditor: boolean |};

class PopupTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, ...task } = props;
    this.state = { ...task, doesShowCalendarEditor: false };
  }

  editTaskName(event: any) {
    event.preventDefault();
    const name = event.target.value;
    this.setState((state: State) => ({ ...state, name }));
  }

  toggleDateEditor() {
    this.setState((state: State) => ({
      ...state, doesShowCalendarEditor: !state.doesShowCalendarEditor,
    }));
  }

  editTaskDate(dateString: string) {
    const date = new Date(dateString);
    this.setState((state: State) => ({ ...state, date, doesShowCalendarEditor: false }));
  }

  editSubTasks(subtaskArray: SubTask[]) {
    this.setState((state: State) => ({ ...state, subtaskArray }));
  }

  submitChanges(event: any) {
    event.preventDefault();
    const { editTask } = this.props;
    const { doesShowCalendarEditor, ...task } = this.state;
    editTask(task);
  }

  render() {
    const {
      name, id, tag, date, subtaskArray, doesShowCalendarEditor,
    } = this.state;
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.PopupTaskEditorCalendar}
        onChange={e => this.editTaskDate(e)}
      />
    );
    return (
      <div id={id}>
        <Header className={styles.PopupTaskEditorFlexibleContainer}>
          <span style={{ marginRight: '0.5em' }}>Main Task: </span>
          <Input
            className={styles.PopupTaskEditorFlexibleInput}
            placeholder="Main Task"
            value={name}
            onChange={event => this.editTaskName(event)}
          />
          <Icon name="tag" style={{ marginLeft: '0.5em' }} />
          <Icon
            name="calendar"
            style={{ marginLeft: '0.5em' }}
            onClick={() => this.toggleDateEditor()}
          />
          {calendarElementOpt}
        </Header>
        <Modal.Description>
          <PopupInternalSubTaskEditor
            subtaskArray={subtaskArray}
            editSubTasks={arr => this.editSubTasks(arr)}
          />
        </Modal.Description>
        <Button onClick={event => this.submitChanges(event)}>Submit</Button>
      </div>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, mapDispatchToProps)(PopupTaskEditor);
export default ConnectedPopupTaskEditor;
