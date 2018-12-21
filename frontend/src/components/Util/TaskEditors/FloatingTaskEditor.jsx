// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import type {
  PartialMainTask, PartialSubTask, SubTask, Task,
} from '../../../store/store-types';
import type { FloatingPosition } from './task-editors-types';
import { editTask as editTaskAction, removeTask as removeTaskAction } from '../../../store/actions';
import TaskEditor from './TaskEditor';
import type { EditTaskAction, RemoveTaskAction } from '../../../store/action-types';
import styles from './FloatingTaskEditor.css';
import { TaskEditorFlexiblePadding as flexiblePaddingClass } from './TaskEditor.css';
import { replaceSubTask } from '../../../util/task-util';
import windowSizeConnect from '../Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Responsive/window-size-context';

type Props = {|
  +position: FloatingPosition;
  +initialTask: Task;
  +trigger: (opened: boolean, opener: () => void) => Node;
  +windowSize: WindowSize;
  +editTask: (task: Task) => EditTaskAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
|};

type State = {| ...Task; +changed: boolean; +open: boolean; |};

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
    this.state = { ...props.initialTask, changed: false, open: false };
  }

  componentDidMount() {
    this.updateFloatingEditorPosition();
  }

  componentWillReceiveProps(nextProps: Props) {
    // This methods ensure that the stuff inside the editor is always the latest from store.
    // Since we implement task in an immutable data structure, a shallow equality comparison is
    // enough.
    const { initialTask } = this.props;
    if (initialTask !== nextProps.initialTask) {
      const nextInitialTask = nextProps.initialTask;
      this.setState({ ...nextInitialTask, changed: false });
    }
  }

  componentDidUpdate() {
    this.updateFloatingEditorPosition();
  }

  /**
   * Update the position of itself.
   */
  updateFloatingEditorPosition = () => {
    const editorPosDiv = this.editorElement;
    if (editorPosDiv == null) {
      return;
    }
    const taskElement = editorPosDiv.previousElementSibling?.previousElementSibling;
    if (taskElement === null || !(taskElement instanceof HTMLDivElement)) {
      throw new Error('Task element must be a div!');
    }
    editorPosDiv.style.position = 'fixed';
    const taskElementBoundingRect = taskElement.getBoundingClientRect();
    if (!(taskElementBoundingRect instanceof DOMRect)) {
      throw new Error('Bad taskElementBoundingRect!');
    }
    const { windowSize } = this.props;
    const myWidth = editorPosDiv.offsetWidth;
    const myHeight = editorPosDiv.offsetHeight;
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;
    if (windowWidth <= 768) {
      editorPosDiv.style.top = `${(windowHeight - myHeight) / 2}px`;
      editorPosDiv.style.left = `${(windowWidth - myWidth) / 2}px`;
      return;
    }
    const { y, left, right } = taskElementBoundingRect;
    const topPos = (y + myHeight) > windowHeight ? windowHeight - myHeight : y;
    editorPosDiv.style.top = `${topPos}px`;
    const { position } = this.props;
    if (position === 'right') {
      editorPosDiv.style.left = `${right}px`;
    } else if (position === 'left') {
      editorPosDiv.style.left = `${left - editorPosDiv.offsetWidth}px`;
    } else {
      throw new Error('Bad floating position!');
    }
  };

  /**
   * Open the popup.
   */
  openPopup = () => this.setState({ open: true });

  /**
   * Close the popup.
   */
  closePopup = (): void => this.setState({ open: false, changed: false });

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
    ...task, subtasks: task.subtasks.filter(t => t.name.trim().length > 0),
  });

  /**
   * Handle the onSave event.
   *
   * @param {boolean} doSave whether to do the actual save. i.e. It not just quits.
   * Defaults to true.
   */
  onSave = (doSave: boolean = true): void => {
    if (!doSave) {
      this.closePopup();
      return;
    }
    const { editTask } = this.props;
    const { open, changed, ...task } = this.state;
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
  editorElement: ?HTMLElement;

  /**
   * Render the manual submit button component.
   *
   * @return {Node} the manual submit button component.
   */
  renderSubmitComponent = (): Node => (
    <div className={styles.FloatingTaskEditorSubmitButtonRow}>
      <span className={flexiblePaddingClass} />
      <div
        role="presentation"
        className={styles.FloatingTaskEditorSaveButton}
        onClick={this.onSave}
      >
        <span className={styles.FloatingTaskEditorSaveButtonText}>Save</span>
      </div>
    </div>
  );

  render(): Node {
    const { trigger, removeTask } = this.props;
    const { open, changed, ...task } = this.state;
    const triggerNode = trigger(open, this.openPopup);
    const blockerNode = open && (
      <div
        className={styles.BackgroundBlocker}
        role="button"
        tabIndex={-1}
        onClick={this.closePopup}
        onKeyDown={this.closePopup}
      />
    );
    const taskEditorProps = {
      ...task,
      editMainTask: (partialMainTask: PartialMainTask, doSave: boolean) => {
        this.setState(
          { ...partialMainTask, changed: true },
          doSave ? this.onSave : undefined,
        );
      },
      editSubTask: (subtaskId: number, partialSubTask: PartialSubTask, doSave: boolean) => {
        this.setState(({ subtasks }: State) => ({
          subtasks: replaceSubTask(
            subtasks, subtaskId, s => ({ ...s, ...partialSubTask }),
          ),
          changed: true,
        }), doSave ? this.onSave : undefined);
      },
      addSubTask: (subTask: SubTask) => {
        this.setState(({ subtasks }: State) => ({
          subtasks: [...subtasks, subTask],
          changed: true,
        }));
      },
      removeTask: () => { removeTask(task.id); },
      removeSubTask: (subtaskId: number) => {
        this.setState(({ subtasks }: State) => ({
          subtasks: subtasks.filter(s => s.id !== subtaskId),
          changed: true,
        }));
      },
      className: styles.FloatingTaskEditor,
      onSave: () => this.onSave(changed),
      refFunction: (e) => { this.editorElement = e; },
    };
    const editorNode = open && (
      <TaskEditor {...taskEditorProps}>{this.renderSubmitComponent()}</TaskEditor>
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

const ConnectedFloatingTaskEditor = connect(
  null,
  { editTask: editTaskAction, removeTask: removeTaskAction },
)(windowSizeConnect<Props>(FloatingTaskEditor));
export default ConnectedFloatingTaskEditor;
