// @flow

import * as React from 'react';
import {
  Header, Input, Icon, Button,
} from 'semantic-ui-react';
import Calendar from 'react-calendar';
import type { Dispatch } from 'redux';
import connect from 'react-redux/es/connect/connect';
import type {
  SubTask, Task, State as StoreState, TagColorConfig,
} from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import styles from './PopupTaskEditor.css';
import PopupInternalSubTaskEditor from './PopupInternalSubTaskEditor';
import NewTaskClassPicker from '../NewTask/NewTaskClassPicker';
import PopupInternalMainTaskEditor from './PopupInternalMainTaskEditor';

const mapStateToProps = ({ tagColorPicker }: StoreState) => ({ tagColorPicker });

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  editTask: (task: Task) => dispatch(editTaskAction(task)),
});

type Props = {|
  ...Task;
  +editTask: (task: Task) => void;
|};
type State = {| ...Task; |};

class PopupTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { editTask, ...task } = props;
    this.state = task;
  }

  editMainTask(task: Task) {
    this.setState((state: State) => ({ ...state, ...task }));
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
    const { subtaskArray } = this.state;
    return (
      <div>
        <PopupInternalMainTaskEditor
          {...this.state}
          editTask={task => this.editMainTask(task)}
        />
        <PopupInternalSubTaskEditor
          subtaskArray={subtaskArray}
          editSubTasks={arr => this.editSubTasks(arr)}
        />
        <Button onClick={event => this.submitChanges(event)}>Submit</Button>
      </div>
    );
  }
}

const ConnectedPopupTaskEditor = connect(mapStateToProps, mapDispatchToProps)(PopupTaskEditor);
export default ConnectedPopupTaskEditor;
