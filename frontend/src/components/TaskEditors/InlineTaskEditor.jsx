// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import type { Task } from '../../store/store-types';
import type { EditTaskAction } from '../../store/action-types';
import { editTask as editTaskAction } from '../../store/actions';
import TaskEditor from './TaskEditor';

type Props = {|
  +initialTask: Task;
  +editTask: (task: Task) => EditTaskAction;
|};

type State = {|
  +isReadOnly: boolean;
  +lastUpdatedTime: number;
  savedTask?: Task;
  intervalId?: IntervalID;
|};

/**
 * The interval to check whether to save tasks.
 * @type {number}
 */
const checkSaveInterval = 5000;

/**
 * The task editor used to edit task inline, activated on focus.
 */
class InlineTaskEditor extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isReadOnly: true,
      lastUpdatedTime: new Date().getTime(),
    };
  }

  componentDidMount() {
    const intervalId = setInterval(this.regularSaveCheck, checkSaveInterval);
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  /**
   * Handler when the component gains focus.
   */
  onFocus = (): void => { console.log('fff'); this.setState({ isReadOnly: false }); };

  /**
   * Handler when the component loses focus.
   */
  onBlur = (): void => { console.log('bb'); this.setState({ isReadOnly: true }); };

  /**
   * Handler when the task editor saves.
   *
   * @param {Task} task the task to save.
   */
  onSave = (task: Task): void => {
    const lastUpdatedTime = new Date().getTime();
    console.log(task, lastUpdatedTime);
    this.setState({ savedTask: task, lastUpdatedTime });
  };

  /**
   * The function is invoked regularly to decide whether to save the task to the store.
   */
  regularSaveCheck = (): void => {
    console.log('try to save...');
    const { savedTask, lastUpdatedTime } = this.state;
    const currentTime = new Date().getTime();
    if (currentTime - lastUpdatedTime > checkSaveInterval && savedTask != null) {
      console.log('ha saved!');
      const { editTask } = this.props;
      editTask(savedTask);
      this.setState({ savedTask: undefined });
    }
  };

  render(): Node {
    const { initialTask } = this.props;
    const { isReadOnly } = this.state;
    // To un-mount the editor when finished editing.
    return (
      <TaskEditor
        initialTask={initialTask}
        isReadOnly={isReadOnly}
        autoSave
        onSave={this.onSave}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}

const ConnectedInlineTaskEditor = connect(null, { editTask: editTaskAction })(InlineTaskEditor);
export default ConnectedInlineTaskEditor;
