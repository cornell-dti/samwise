// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import type { Task } from '../../store/store-types';
import type { FloatingPosition } from './task-editors-types';
import { editTask as editTaskAction } from '../../store/actions';
import TaskEditor from './TaskEditor';
import type { EditTaskAction } from '../../store/action-types';
import styles from './FloatingTaskEditor.css';

type Props = {|
  +position: FloatingPosition;
  +initialTask: Task;
  +trigger: (opener: () => void) => Node;
  +editTask: (task: Task) => EditTaskAction;
|};

type State = {| +open: boolean; |};

/**
 * FloatingTaskEditor is a component used to edit a task on the fly.
 * It is triggered from a click on a specified element.
 *
 * Usage:
 * ```jsx
 * <FloatingTaskEditor
 *   position="left"
 *   initialTask={task}
 *   trigger={opener => <span onClick={opener}>Ha</span>}
 * />
 * ```
 */
class FloatingTaskEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { open: false };
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
    const taskElementBoundingRect = taskElement.getBoundingClientRect();
    if (!(taskElementBoundingRect instanceof DOMRect)) {
      throw new Error('Bad taskElementBoundingRect!');
    }
    const { x, y } = taskElementBoundingRect;
    editorPosDiv.style.position = 'unset';
    editorPosDiv.style.top = `${y}px`;
    if (position === 'right') {
      editorPosDiv.style.left = `${x + taskElement.offsetWidth}px`;
    } else if (position === 'left') {
      editorPosDiv.style.left = `${x + -editorPosDiv.offsetWidth}px`;
    } else {
      throw new Error('Bad floating position!');
    }
    editorPosDiv.style.position = 'fixed';
  }

  /**
   * Open the popup.
   */
  openPopup = (): void => this.setState({ open: true });

  /**
   * Close the popup.
   */
  closePopup = (): void => this.setState({ open: false });

  /**
   * Handle the onSave event.
   *
   * @param {Task} task task to save.
   */
  onSave = (task: Task): void => {
    const { editTask } = this.props;
    editTask(task);
    this.closePopup();
  };

  /**
   * The element of the actual editor.
   * This is only used when the editor is embedded inside the DOM instead of mount to body.
   */
  editorElement: ?HTMLDivElement;

  render(): Node {
    const { initialTask, trigger } = this.props;
    const { open } = this.state;
    const triggerNode = trigger(this.openPopup);
    const blockerNode = open && (
      <div
        className={styles.FloatingTaskEditorBackgroundBlocker}
        role="button"
        tabIndex={-1}
        onClick={this.closePopup}
        onKeyDown={this.closePopup}
      />
    );
    const editorNode = open && (
      <TaskEditor
        initialTask={initialTask}
        autoSave={false}
        onSave={this.onSave}
        className={styles.FloatingTaskEditor}
        refFunction={(e) => { this.editorElement = e; }}
      />
    );
    return (
      <React.Fragment>
        {triggerNode}
        {blockerNode}
        {editorNode}
      </React.Fragment>
    );
  }
}

const ConnectedFloatingTaskEditor = connect(null, { editTask: editTaskAction })(FloatingTaskEditor);
export default ConnectedFloatingTaskEditor;
