// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import type {
  ColorConfig, State as StoreState, SubTask, Task,
} from '../../store/store-types';
import { editTask as editTaskAction } from '../../store/actions';
import InternalMainTaskEditor from './InternalMainTaskEditor';
import InternalSubTaskEditor from './InternalSubTaskEditor';
import type { EditTaskAction } from '../../store/action-types';
import type { SimpleMainTask } from './floating-task-editor-types';
import styles from './FloatingTaskEditor.css';
import { fullConnect } from '../../store/react-redux-util';

type OwnProps = {|
  +initialTask: Task;
  +onSave: () => void;
  +refFunction: (HTMLDivElement | null) => void;
|};
type SubscribedProps = {| +colors: ColorConfig; |};
type ActionProps = {| +editTask: (task: Task) => EditTaskAction; |};

type Props = {| ...OwnProps; ...SubscribedProps; ...ActionProps |};

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
  backgroundColor: '',
  mainTaskInputFocused: true,
};


class TaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { initialTask, colors } = props;
    this.state = { ...trivialState, ...initialTask, backgroundColor: colors[initialTask.tag] };
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
   * Update the state to contain the given latest edited main task.
   *
   * @param {SimpleMainTask} task the latest edited main task.
   */
  editMainTask = (task: SimpleMainTask): void => {
    const { colors } = this.props;
    this.setState((state: State) => ({ ...state, ...task, backgroundColor: colors[task.tag] }));
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
    const { backgroundColor, mainTaskInputFocused, ...task } = this.state;
    if (!this.taskIsGood(task)) {
      return;
    }
    editTask(this.filterEmptySubTasks(task));
    const { onSave } = this.props;
    onSave();
  };

  /**
   * Render the manual submit button component.
   *
   * @return {Node} the manual submit button component.
   */
  renderManualSubmitComponent(): Node {
    return (
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
    );
  }

  render(): Node {
    const { refFunction } = this.props;
    const { backgroundColor, mainTaskInputFocused, ...task } = this.state;
    const {
      id, subtaskArray, ...mainTask
    } = task;
    return (
      <div
        className={styles.EmbeddedFloatingTaskEditor}
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
        {this.renderManualSubmitComponent()}
      </div>
    );
  }
}

const ConnectedTaskEditor = fullConnect<Props, OwnProps, SubscribedProps, ActionProps>(
  mapStateToProps, { editTask: editTaskAction },
)(TaskEditor);
export default ConnectedTaskEditor;
