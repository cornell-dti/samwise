// @flow strict

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
import type { FloatingPosition, SimpleMainTask } from './floating-task-editor-types';

type Props = {|
  position?: FloatingPosition;
  +trigger: (opener: (task: Task, backgroundColor: string) => void) => Node;
  +editTask: (task: Task) => EditTaskAction;
|};

type State = {|
  ...SimpleMainTask;
  +id: number;
  +subtaskArray: SubTask[];
  +open: boolean;
  +backgroundColor: string;
  +mainTaskInputFocused: boolean;
|};

/**
 * A trivial state used to reset things.
 * @type {State}
 */
const trivialState: State = {
  id: 0,
  name: '',
  tag: '',
  date: new Date(),
  complete: false,
  inFocus: false,
  subtaskArray: [],
  open: false,
  backgroundColor: '',
  mainTaskInputFocused: true,
};

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 *
 * Usage:
 * ```jsx
 * <FloatingTaskEditor
 *   position="beside"
 *   trigger={opener => <span onClick={() => opener(task, color)}>Ha</span>}
 * />
 * ```
 */
class FloatingTaskEditor extends React.Component<Props, State> {
  static defaultProps = {
    position: undefined,
  };

  constructor(props: Props) {
    super(props);
    this.state = trivialState;
  }

  componentDidUpdate({ position }: Props) {
    const editorPosDiv = this.editorElement;
    if (editorPosDiv == null || position == null) {
      return;
    }
    const taskElement = editorPosDiv.previousElementSibling?.previousElementSibling;
    if (taskElement === null || !(taskElement instanceof HTMLDivElement)) {
      throw new Error('Task element must be a div!');
    }
    editorPosDiv.style.position = 'unset';
    if (position === 'below') {
      editorPosDiv.style.top = `${editorPosDiv.offsetTop - 12}px`;
      editorPosDiv.style.left = '0';
      editorPosDiv.style.position = 'absolute';
    } else if (position === 'right') {
      editorPosDiv.style.top = `${editorPosDiv.offsetTop - taskElement.clientHeight - 12}px`;
      editorPosDiv.style.left = `${taskElement.offsetWidth}px`;
      editorPosDiv.style.position = 'absolute';
    } else if (position === 'left') {
      editorPosDiv.style.top = `${editorPosDiv.offsetTop - taskElement.clientHeight - 12}px`;
      editorPosDiv.style.left = `-${editorPosDiv.offsetWidth}px`;
      editorPosDiv.style.position = 'absolute';
    }
  }

  /**
   * Returns the floating position of the editor.
   *
   * @return {FloatingPosition} the floating position of the editor.
   */
  getFloatingPosition(): FloatingPosition {
    const { position } = this.props;
    return position || 'center';
  }

  /**
   * Open the popup.
   *
   * @param {Task} task the task used to initialized the modal.
   * @param {string} backgroundColor the background color used to initialized the modal.
   */
  openPopup = (task: Task, backgroundColor: string): void => {
    this.setState((state: State) => ({
      ...state, ...task, backgroundColor, open: true,
    }));
  };

  /**
   * Close the popup.
   */
  closePopup = (): void => {
    this.setState((state: State) => ({ ...state, open: false }));
  };

  /**
   * Check whether a task has a good format.
   *
   * @param {Task} task the task to check.
   * @return {boolean} whether the task has a good format.
   */
  taskIsGood = (task: Task): boolean => task.name.trim().length > 0;

  /**
   * Filter the task without all the empty subtasks.
   *
   * @param {Task} task the task to filter.
   * @return {Task} the filtered task.
   */
  filterEmptySubTasks = (task: Task): Task => ({
    ...task, subtaskArray: task.subtaskArray.filter(t => t.name.trim().length > 0),
  });

  /**
   * Update the state to contain the given latest edited main task.
   *
   * @param {SimpleMainTask} task the latest edited main task.
   * @param {string} backgroundColor the optional new background color after the edit.
   */
  editMainTask = (task: SimpleMainTask, backgroundColor?: string): void => {
    if (backgroundColor != null) {
      this.setState((state: State) => ({ ...state, ...task, backgroundColor }));
    } else {
      this.setState((state: State) => ({ ...state, ...task }));
    }
  };

  /**
   * Update the state to contain the given latest edited subtask array.
   *
   * @param subtaskArray the latest edited subtask array.
   */
  editSubTasks = (subtaskArray: SubTask[]): void => {
    this.setState((state: State) => ({ ...state, subtaskArray }));
  };

  /**
   * Submit all the changes when clicking submit.
   *
   * @param event the event that notifies about clicking 'submit'.
   */
  submitChanges = (event: ?Event = null): void => {
    if (event != null) {
      event.preventDefault();
    }
    const { editTask } = this.props;
    const {
      open, backgroundColor, mainTaskInputFocused, ...task
    } = this.state;
    if (!this.taskIsGood(task)) {
      return;
    }
    editTask(this.filterEmptySubTasks(task));
    this.closePopup();
  };

  /**
   * The element of the actual editor.
   * This is only used when the editor is embedded inside the DOM instead of mount to body.
   */
  editorElement: ?HTMLDivElement;

  /**
   * Render the internals of the modal.
   *
   * @return {Node} the internals of the modal.
   */
  renderModalInternal(): Node {
    const {
      open, backgroundColor, mainTaskInputFocused, ...task
    } = this.state;
    const {
      id, subtaskArray, ...mainTask
    } = task;
    const doesMountInside = this.getFloatingPosition() !== 'center';
    const className = doesMountInside ? styles.EmbeddedFloatingTaskEditor : '';
    const style = doesMountInside ? { backgroundColor } : {};
    const refFunction = doesMountInside
      ? (e) => { this.editorElement = e; }
      : () => {};
    return (
      <div className={className} style={style} ref={refFunction}>
        <InternalMainTaskFloatingEditor
          {...mainTask}
          focused={mainTaskInputFocused}
          editTask={(t, c) => this.editMainTask(t, c)}
          onFocusChange={f => this.setState(s => ({ ...s, mainTaskInputFocused: f }))}
        />
        <InternalSubTaskFloatingEditor
          focused={!mainTaskInputFocused}
          subtaskArray={subtaskArray}
          editSubTasks={arr => this.editSubTasks(arr)}
        />
        <div className={styles.FloatingTaskEditorSubmitButtonRow}>
          <span className={styles.FloatingTaskEditorFlexiblePadding} />
          <div
            className={styles.FloatingEditorSaveButton}
            role="button"
            tabIndex={0}
            onClick={this.submitChanges}
            onKeyDown={this.submitChanges}
          >
            <span className={styles.FloatingEditorSaveButtonText}>Save</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render the modal editor.
   *
   * @param {Node} triggerNode the node that triggers the modal.
   * @return {Node} the rendered modal.
   */
  renderModalEditor(triggerNode: Node): Node {
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

  /**
   * Render the embedded editor.
   *
   * @param {Node} triggerNode the node that triggers the modal.
   * @return {Node} the rendered editor.
   */
  renderEmbeddedEditor(triggerNode: Node): Node {
    const { open } = this.state;
    return (
      <React.Fragment>
        {triggerNode}
        {
          open && (
            <div
              className={styles.FloatingTaskEditorBackgroundBlocker}
              role="button"
              tabIndex={-1}
              onClick={this.closePopup}
              onKeyDown={this.closePopup}
            />
          )
        }
        {open && this.renderModalInternal()}
      </React.Fragment>
    );
  }

  render(): Node {
    const { trigger } = this.props;
    const triggerNode = trigger(this.openPopup);
    const floatingPosition = this.getFloatingPosition();
    return (floatingPosition === 'center')
      ? this.renderModalEditor(triggerNode)
      : this.renderEmbeddedEditor(triggerNode);
  }
}

const ConnectedPopupTaskEditor = connect(null, { editTask: editTaskAction })(FloatingTaskEditor);
export default ConnectedPopupTaskEditor;
