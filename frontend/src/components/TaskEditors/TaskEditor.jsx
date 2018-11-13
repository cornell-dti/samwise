// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import type {
  ColorConfig, State as StoreState, SubTask, Task,
} from '../../store/store-types';
import InternalMainTaskEditor from './InternalMainTaskEditor';
import InternalSubTaskEditor from './InternalSubTaskEditor';
import type { SimpleMainTask } from './floating-task-editor-types';
import styles from './TaskEditor.css';
import { simpleConnect } from '../../store/react-redux-util';

type OwnProps = {|
  +initialTask: Task; // The initial task to edit, as a starting point.
  +autoSave: boolean; // whether to auto-save changes
  +onSave: (Task) => void; // called when the task is saved, either automatically or save by user.
  +refFunction: (HTMLDivElement | null) => void; // used to get the div DOM element.
|};
type SubscribedProps = {| +colors: ColorConfig; |};
type Props = {| ...OwnProps; ...SubscribedProps |};

type State = {|
  ...SimpleMainTask;
  +id: number;
  +subtaskArray: SubTask[];
  +backgroundColor: string;
  +mainTaskInputFocused: boolean;
|};

const mapStateToProps = ({ classColorConfig, tagColorConfig }: StoreState): SubscribedProps => ({
  colors: { ...classColorConfig, ...tagColorConfig },
});

/**
 * The component of an standalone task editor. It is designed to be wrapped inside another
 * component to extend its functionality.
 */
class TaskEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { initialTask, colors } = props;
    this.state = {
      ...initialTask, backgroundColor: colors[initialTask.tag], mainTaskInputFocused: true,
    };
  }

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
   * The auto save handler.
   */
  autoSave = (): void => {
    const { autoSave } = this.props;
    if (autoSave) {
      this.submitChanges();
    }
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
    const { backgroundColor, mainTaskInputFocused, ...task } = this.state;
    if (!this.taskIsGood(task)) {
      return;
    }
    const { onSave } = this.props;
    onSave(this.filterEmptySubTasks(task));
  };

  /**
   * Update the state to contain the given latest edited main task.
   *
   * @param {SimpleMainTask} task the latest edited main task.
   */
  editMainTask = (task: SimpleMainTask): void => {
    const { colors } = this.props;
    this.setState({ ...task, backgroundColor: colors[task.tag] }, this.autoSave);
  };

  /**
   * Update the state to contain the given latest edited subtask array.
   *
   * @param subtaskArray the latest edited subtask array.
   */
  editSubTasks = (subtaskArray: SubTask[]): void => {
    this.setState({ subtaskArray }, this.autoSave);
  };

  /**
   * Render the manual submit button component.
   *
   * @return {Node} the manual submit button component.
   */
  renderManualSubmitComponent(): Node {
    return (
      <div className={styles.TaskEditorSubmitButtonRow}>
        <span className={styles.TaskEditorFlexiblePadding} />
        <div
          className={styles.TaskEditorSaveButton}
          role="button"
          tabIndex={0}
          onClick={this.submitChanges}
          onKeyDown={this.submitChanges}
        >
          <span className={styles.TaskEditorSaveButtonText}>Save</span>
        </div>
      </div>
    );
  }

  render(): Node {
    const { autoSave, refFunction } = this.props;
    const { backgroundColor, mainTaskInputFocused, ...task } = this.state;
    const {
      id, subtaskArray, ...mainTask
    } = task;
    return (
      <div
        className={styles.TaskEditor}
        style={{ backgroundColor }}
        ref={refFunction}
      >
        <InternalMainTaskEditor
          {...mainTask}
          focused={mainTaskInputFocused}
          editTask={this.editMainTask}
          onFocusChange={f => this.setState({ mainTaskInputFocused: f })}
        />
        <InternalSubTaskEditor
          focused={!mainTaskInputFocused}
          subtaskArray={subtaskArray}
          editSubTasks={this.editSubTasks}
          onFocusChange={f => this.setState({ mainTaskInputFocused: !f })}
        />
        {!autoSave && this.renderManualSubmitComponent()}
      </div>
    );
  }
}

const ConnectedTaskEditor = simpleConnect<Props, OwnProps, SubscribedProps>(
  mapStateToProps,
)(TaskEditor);
export default ConnectedTaskEditor;
