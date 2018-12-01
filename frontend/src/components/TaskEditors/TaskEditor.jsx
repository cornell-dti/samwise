// @flow strict

import React from 'react';
import type { Node } from 'react';
import type {
  Tag, State as StoreState, SubTask, Task,
} from '../../store/store-types';
import InternalMainTaskEditor from './InternalMainTaskEditor';
import InternalSubTaskEditor from './InternalSubTaskEditor';
import type { SimpleMainTask } from './task-editors-types';
import styles from './TaskEditor.css';
import { simpleConnect } from '../../store/react-redux-util';
import { getColorByTagId } from '../../util/tag-util';

type OwnProps = {|
  +initialTask: Task; // The initial task to edit, as a starting point.
  isReadOnly?: boolean; // whether the editor is read-only, which defaults to false.
  +autoSave: boolean; // whether to auto-save changes
  +onSave: (Task) => void; // called when the task is saved, either automatically or save by user.
  className?: string;
  onFocus?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  onBlur?: (event: SyntheticFocusEvent<HTMLElement>) => void;
  refFunction?: (HTMLDivElement | null) => void; // used to get the div DOM element.
|};
type SubscribedProps = {| +tags: Tag[]; |};
type Props = {| ...OwnProps; ...SubscribedProps |};

type State = {|
  ...SimpleMainTask;
  +subtaskArray: SubTask[];
  +backgroundColor: string;
  +mainTaskInputFocused: boolean;
|};

const mapStateToProps = ({ tags }: StoreState): SubscribedProps => ({ tags });

/**
 * The component of an standalone task editor. It is designed to be wrapped inside another
 * component to extend its functionality.
 * You can read the docs for props above.
 */
class TaskEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { initialTask, tags } = props;
    this.state = {
      ...initialTask,
      backgroundColor: getColorByTagId(tags, initialTask.tag),
      mainTaskInputFocused: true,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // This methods ensure that the stuff inside the editor is always the latest from store.
    // Since we implement task in an immutable data structure, a shallow equality comparison is
    // enough.
    const { initialTask, tags } = this.props;
    if (initialTask !== nextProps.initialTask || tags !== nextProps.tags) {
      const nextInitialTask = nextProps.initialTask;
      const backgroundColor = getColorByTagId(nextProps.tags, nextInitialTask.tag);
      this.setState({ ...nextInitialTask, backgroundColor });
    }
  }

  /**
   * Report whether the task editor is read only.
   *
   * @return {boolean} whether the task editor is read only.
   */
  isReadOnly = (): boolean => {
    const { isReadOnly } = this.props;
    return isReadOnly != null && isReadOnly;
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
    const { tags } = this.props;
    this.setState({ ...task, backgroundColor: getColorByTagId(tags, task.tag) }, this.autoSave);
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
    const {
      autoSave, className, tags, onFocus, onBlur, refFunction,
    } = this.props;
    const { backgroundColor, mainTaskInputFocused, ...task } = this.state;
    const {
      subtaskArray, ...mainTask
    } = task;
    const readOnly = this.isReadOnly();
    const actualClassName = className == null
      ? styles.TaskEditor : `${styles.TaskEditor} ${className}`;
    return (
      <div
        tabIndex={-1}
        className={actualClassName}
        style={{ backgroundColor }}
        onMouseEnter={onFocus}
        onMouseLeave={onBlur}
        onFocus={onFocus}
        onBlur={() => {}}
        ref={refFunction}
      >
        <InternalMainTaskEditor
          {...mainTask}
          tags={tags}
          focused={!readOnly && mainTaskInputFocused}
          editTask={this.editMainTask}
          onFocusChange={f => this.setState({ mainTaskInputFocused: f })}
        />
        <InternalSubTaskEditor
          focused={!readOnly && !mainTaskInputFocused}
          isReadOnly={readOnly}
          subtaskArray={subtaskArray}
          editSubTasks={this.editSubTasks}
          onFocusChange={f => this.setState({ mainTaskInputFocused: !f })}
        />
        {!autoSave && this.renderManualSubmitComponent()}
      </div>
    );
  }
}

const ConnectedTaskEditor = simpleConnect<OwnProps, SubscribedProps>(
  mapStateToProps,
)(TaskEditor);
export default ConnectedTaskEditor;
