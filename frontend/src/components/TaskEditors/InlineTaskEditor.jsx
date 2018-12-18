// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import type { Task } from '../../store/store-types';
import type { EditTaskAction } from '../../store/action-types';
import { editTask as editTaskAction } from '../../store/actions';
import TaskEditor from './TaskEditor';

type OwnProps = {|
  +initialTask: Task; // the initial task given to the editor.
  +editTask: (task: Task) => EditTaskAction;
|};
type DefaultProps = {|
  +className?: string; // additional class names applied to the editor.
|};
type Props = {|
  ...OwnProps;
  ...DefaultProps;
|};

type State = {|
  +isReadOnly: boolean;
  +savedTask?: Task; // has a value only when there is some unsaved state.
  +intervalId?: IntervalID; // used for regular saving
|};

/**
 * The interval to check whether to save tasks.
 * @type {number}
 */
const doSaveInterval = 2000;

/**
 * The task editor used to edit task inline, activated on focus.
 */
class InlineTaskEditor extends React.Component<Props, State> {
  static defaultProps: DefaultProps;

  state: State = { isReadOnly: true };

  componentDidMount() {
    const intervalId = setInterval(this.regularSaveCheck, doSaveInterval);
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  /**
   * Handler when the component gains focus.
   */
  onFocus = (): void => {
    this.setState({ isReadOnly: false });
  };

  /**
   * Handler when the component loses focus.
   */
  onBlur = (): void => {
    this.setState({ isReadOnly: true });
  };

  /**
   * Handler when the task editor saves.
   *
   * @param {Task} task the task to save.
   */
  onSave = (task: Task): void => {
    this.setState({ savedTask: task });
  };

  /**
   * The function is invoked regularly to decide whether to save the task to the store.
   */
  regularSaveCheck = (): void => {
    const { savedTask } = this.state;
    if (savedTask != null) {
      const { editTask } = this.props;
      editTask(savedTask);
      this.setState({ savedTask: undefined });
    }
  };

  render(): Node {
    const { initialTask, className } = this.props;
    const { isReadOnly } = this.state;
    // To un-mount the editor when finished editing.
    return (
      <TaskEditor
        initialTask={initialTask}
        isReadOnly={isReadOnly}
        saveImmediately
        onSave={this.onSave}
        className={className}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}

InlineTaskEditor.defaultProps = {
  className: undefined,
};

const ConnectedInlineTaskEditor = connect(null, { editTask: editTaskAction })(InlineTaskEditor);
export default ConnectedInlineTaskEditor;
