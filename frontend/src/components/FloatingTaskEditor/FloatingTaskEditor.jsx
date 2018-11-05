// @flow strict
/* eslint-disable jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */

import * as React from 'react';
import type { Node } from 'react';
import { Modal } from 'semantic-ui-react';
import connect from 'react-redux/es/connect/connect';
import { bindActionCreators } from 'redux';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import InternalSubTaskFloatingEditor from './InternalSubTaskFloatingEditor';
import InternalMainTaskFloatingEditor from './InternalMainTaskFloatingEditor';
import type { Dispatch, EditTaskAction } from '../../store/action-types';
import styles from './FloatingTaskEditor.css';

type Props = {|
  ...Task;
  +backgroundColor: string;
  +editTask: (task: Task) => EditTaskAction;
  +trigger: (opener: () => void) => React.Node;
|};
type State = {| ...Task; +open: boolean; +backgroundColor: string; |};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  { editTask: editTaskAction }, dispatch,
);

class FloatingTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {
      backgroundColor, editTask, trigger, ...task
    } = props;
    this.state = { ...task, open: false, backgroundColor };
  }

  internalSubTaskEditor: ?InternalSubTaskFloatingEditor;

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
   * @param {Task} task the latest edited main task.
   * @param {string} backgroundColor the optional new background color after the edit.
   */
  editMainTask(task: Task, backgroundColor?: string) {
    if (backgroundColor) {
      this.setState((state: State) => ({ ...state, ...task, backgroundColor }));
    } else {
      this.setState((state: State) => ({ ...state, ...task }));
    }
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
  submitChanges(event: ?Event = null) {
    if (event) {
      event.preventDefault();
    }
    const subTaskEditor = this.internalSubTaskEditor;
    if (subTaskEditor == null) {
      throw new Error('Impossible!');
    }
    const { editTask } = this.props;
    const { open, backgroundColor, ...task } = this.state;
    const latestTask: Task = { ...task, subtaskArray: subTaskEditor.reportLatestSubtaskArray() };
    editTask(latestTask);
    this.closePopup();
  }

  render(): Node {
    const { trigger } = this.props;
    const {
      open, backgroundColor, subtaskArray, ...task
    } = this.state;
    const triggerNode = trigger(() => this.openPopup());
    return (
      <Modal
        className={styles.FloatingTaskEditor}
        style={{ backgroundColor }}
        dimmer="inverted"
        open={open}
        trigger={triggerNode}
        onClose={() => this.closePopup()}
      >
        <div>
          <InternalMainTaskFloatingEditor
            {...task}
            editTask={(t, c) => this.editMainTask(t, c)}
          />
          <InternalSubTaskFloatingEditor
            ref={(e) => {
              this.internalSubTaskEditor = e;
            }}
            subtaskArray={subtaskArray}
            editSubTasks={arr => this.editSubTasks(arr)}
          />
          <div className={styles.FloatingTaskEditorSubmitButtonRow}>
            <span className={styles.FloatingTaskEditorFlexiblePadding} />
            <div className={styles.FloatingEditorSaveButton} onClick={e => this.submitChanges(e)}>
              <span className={styles.FloatingEditorSaveButtonText}>Save</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, mapDispatchToProps)(FloatingTaskEditor);
export default ConnectedPopupTaskEditor;
