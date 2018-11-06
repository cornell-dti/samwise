// @flow strict
/* eslint-disable jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */

import * as React from 'react';
import type { Node } from 'react';
import { Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import InternalSubTaskFloatingEditor from './InternalSubTaskFloatingEditor';
import InternalMainTaskFloatingEditor from './InternalMainTaskFloatingEditor';
import type { EditTaskAction } from '../../store/action-types';
import styles from './FloatingTaskEditor.css';

type Props = {|
  mountInside?: boolean;
  +trigger: (opener: (task: Task, backgroundColor: string) => void) => Node;
  +editTask: (task: Task) => EditTaskAction;
|};

type State = {| ...Task; +open: boolean; +backgroundColor: string; |};

/**
 * A trivial state used to reset things.
 * @type {State}
 */
const trivialState: State = {
  name: '',
  id: 0,
  tag: '',
  date: new Date(),
  complete: false,
  inFocus: false,
  subtaskArray: [],
  open: false,
  backgroundColor: '',
};

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 *
 * Usage:
 * ```jsx
 * <FloatingTaskEditor
 *   mountOnTriggerNode={false}
 *   trigger={opener => <span onClick={() => opener(task, color)}>Ha</span>}
 * />
 * ```
 */
class FloatingTaskEditor extends React.Component<Props, State> {
  static defaultProps = {
    mountInside: undefined,
  };

  constructor(props: Props) {
    super(props);
    this.state = trivialState;
  }

  /**
   * Open the popup.
   *
   * @param {Task} task the task used to initialized the modal.
   * @param {string} backgroundColor the background color used to initialized the modal.
   */
  openPopup(task: Task, backgroundColor: string) {
    this.setState((state: State) => ({
      ...state, ...task, backgroundColor, open: true,
    }));
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
    if (backgroundColor != null) {
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
    if (event != null) {
      event.preventDefault();
    }
    const { editTask } = this.props;
    const { open, backgroundColor, ...task } = this.state;
    editTask(task);
    this.closePopup();
  }

  /**
   * Render the internals of the modal.
   *
   * @param {string} className the additional class name of the internal content.
   * @return {Node} the internals of the modal.
   */
  renderModalInternal(className: string = ''): Node {
    const { open, backgroundColor, ...task } = this.state;
    const { subtaskArray } = task;
    return (
      <div className={className} style={{ backgroundColor }}>
        <InternalMainTaskFloatingEditor
          {...task}
          editTask={(t, c) => this.editMainTask(t, c)}
        />
        <InternalSubTaskFloatingEditor
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
    );
  }

  /**
   * Render the modal.
   *
   * @param {Node} triggerNode the node that triggers the modal.
   * @return {Node} the rendered modal.
   */
  renderModal(triggerNode: Node): Node {
    const { open, backgroundColor } = this.state;
    return (
      <Modal
        className={styles.FloatingTaskEditor}
        style={{ backgroundColor }}
        size="mini"
        open={open}
        trigger={triggerNode}
        onClose={() => this.closePopup()}
      >
        {this.renderModalInternal()}
      </Modal>
    );
  }

  render(): Node {
    const { mountInside, trigger } = this.props;
    const { open } = this.state;
    const triggerNode = trigger((t, c) => this.openPopup(t, c));
    if (mountInside == null || mountInside === false) {
      return this.renderModal(triggerNode);
    }
    const editor = this.renderModalInternal(styles.EmbeddedFloatingTaskEditor);
    return (
      <React.Fragment>
        {triggerNode}
        {
          open && (
            <div
              className={styles.FloatingTaskEditorBackgroundBlocker}
              onClick={() => this.closePopup()}
            />
          )
        }
        {open && editor}
      </React.Fragment>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, { editTask: editTaskAction })(FloatingTaskEditor);
export default ConnectedPopupTaskEditor;
