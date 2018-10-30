// @flow

import * as React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import type { Dispatch } from 'redux';
import connect from 'react-redux/es/connect/connect';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import PopupInternalSubTaskEditor from './PopupInternalSubTaskEditor';
import PopupInternalMainTaskEditor from './PopupInternalMainTaskEditor';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  editTask: (task: Task): void => dispatch(editTaskAction(task)),
});

type Props = {|
  ...Task;
  +editTask: (task: Task) => void;
  +trigger: (opener: () => void) => React.Node;
|};
type State = {| ...Task; open: boolean |};

class PopupTaskEditor extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    const { editTask, trigger, ...task } = props;
    this.state = { ...task, open: false };
  }

  internalSubTaskEditor: ?PopupInternalSubTaskEditor;

  /**
   * Open the popup.
   */
  openPopup() {
    this.setState((state: State) => ({ ...state, open: true }));
  }

  /**
   * Close the popup.
   */
  closePopup() {
    this.setState((state: State) => ({ ...state, open: false }));
  }

  /**
   * Update the state to contain the given latest edited main task.
   *
   * @param task the latest edited main task.
   */
  editMainTask(task: Task) {
    this.setState((state: State) => ({ ...state, ...task }));
  }

  /**
   * Update the state to contain the given latest edited subtask array.
   *
   * @param subtaskArray the latest edited subtask array.
   */
  editSubTasks(subtaskArray: SubTask[]) {
    this.setState((state: State) => ({ ...state, subtaskArray }));
  }

  /**
   * Submit all the changes when clicking submit.
   *
   * @param event the event that notifies about clicking 'submit'.
   */
  submitChanges(event: Event) {
    event.preventDefault();
    const subTaskEditor = this.internalSubTaskEditor;
    if (subTaskEditor == null) {
      throw new Error('Impossible!');
    }
    const { editTask } = this.props;
    const { open, ...task } = this.state;
    const latestTask: Task = { ...task, subtaskArray: subTaskEditor.reportLatestSubtaskArray() };
    editTask(latestTask);
    this.closePopup();
  }

  render(): React.Node {
    const { trigger } = this.props;
    const { open, subtaskArray, ...task } = this.state;
    const triggerNode = trigger(() => this.openPopup());
    return (
      <Modal dimmer="inverted" open={open} trigger={triggerNode} onClose={() => this.closePopup()}>
        <Modal.Header>Task Editor</Modal.Header>
        <Modal.Content>
          <PopupInternalMainTaskEditor
            {...task}
            editTask={t => this.editMainTask(t)}
          />
          <PopupInternalSubTaskEditor
            ref={(e) => {
              this.internalSubTaskEditor = e;
            }}
            subtaskArray={subtaskArray}
            editSubTasks={arr => this.editSubTasks(arr)}
          />
          <Button onClick={event => this.submitChanges(event)}>Submit</Button>
        </Modal.Content>
      </Modal>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, mapDispatchToProps)(PopupTaskEditor);
export default ConnectedPopupTaskEditor;
