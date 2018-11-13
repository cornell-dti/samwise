// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import type { Task } from '../../store/store-types';
import type { FloatingPosition } from './floating-task-editor-types';
import styles from './FloatingTaskEditor.css';
import TaskEditor from './TaskEditor';

type Props = {|
  +position: FloatingPosition;
  +initialTask: Task;
  +trigger: (opener: () => void) => Node;
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
 *   trigger={opener => <span onClick={() => opener(task)}>Ha</span>}
 * />
 * ```
 */
export default class FloatingTaskEditor extends React.Component<Props, State> {
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
    editorPosDiv.style.position = 'unset';
    editorPosDiv.style.top = `${editorPosDiv.offsetTop - taskElement.clientHeight - 12}px`;
    if (position === 'right') {
      editorPosDiv.style.left = `${taskElement.offsetWidth}px`;
    } else if (position === 'left') {
      editorPosDiv.style.left = `${-editorPosDiv.offsetWidth}px`;
    } else {
      throw new Error('Bad floating position!');
    }
    editorPosDiv.style.position = 'absolute';
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
        onSave={this.closePopup}
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
