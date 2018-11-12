// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import type { SubTask, Task } from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import InternalMainTaskEditor from './InternalMainTaskEditor';
import InternalSubTaskEditor from './InternalSubTaskEditor';
import type { EditTaskAction } from '../../store/action-types';
import type { FloatingPosition, SimpleMainTask } from './floating-task-editor-types';
import styles from './FloatingTaskEditor.css';

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
 *   position="left"
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
    editorPosDiv.style.top = `${editorPosDiv.offsetTop - taskElement.clientHeight - 12}px`;
    if (position === 'right') {
      editorPosDiv.style.left = `${taskElement.offsetWidth}px`;
    } else if (position === 'left') {
      editorPosDiv.style.left = `-${editorPosDiv.offsetWidth}px`;
    } else {
      throw new Error('Bad floating position!');
    }
    editorPosDiv.style.position = 'absolute';
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
   * Render the editor component.
   *
   * @return {Node} the editor component.
   */
  renderEditorComponent(): Node {
    const {
      open, backgroundColor, mainTaskInputFocused, ...task
    } = this.state;
    const {
      id, subtaskArray, ...mainTask
    } = task;
    return (
      <div
        className={styles.EmbeddedFloatingTaskEditor}
        style={{ backgroundColor }}
        ref={(e) => { this.editorElement = e; }}
      >
        <InternalMainTaskEditor
          {...mainTask}
          focused={mainTaskInputFocused}
          editTask={(t, c) => this.editMainTask(t, c)}
          onFocusChange={f => this.setState(s => ({ ...s, mainTaskInputFocused: f }))}
        />
        <InternalSubTaskEditor
          focused={!mainTaskInputFocused}
          subtaskArray={subtaskArray}
          editSubTasks={arr => this.editSubTasks(arr)}
          onFocusChange={f => this.setState(s => ({ ...s, mainTaskInputFocused: !f }))}
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

  render(): Node {
    const { trigger } = this.props;
    const { open } = this.state;
    const triggerNode = trigger(this.openPopup);
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
        {open && this.renderEditorComponent()}
      </React.Fragment>
    );
  }
}

const ConnectedPopupTaskEditor = connect(null, { editTask: editTaskAction })(FloatingTaskEditor);
export default ConnectedPopupTaskEditor;
