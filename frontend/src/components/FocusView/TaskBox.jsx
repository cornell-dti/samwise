// @flow strict

import React from 'react';
import type { Node } from 'react';
import SubTaskBox from './SubTaskBox';
import { markTask as markTaskAction, addSubtask as addSubtaskAction } from '../../store/actions';
import type {
  State as StoreState, ColorConfig, Task, SubTask,
} from '../../store/store-types';
import type { AddNewSubTaskAction, MarkTaskAction } from '../../store/action-types';
import { fullConnect } from '../../store/react-redux-util';
import CheckBox from '../UI/CheckBox';
import styles from './TaskBox.css';
import InlineTaskEditor from '../TaskEditors/InlineTaskEditor';

type OwnProps = Task;
type SubscribedProps = {| +colorConfig: ColorConfig |};
type DispatchedProps = {|
  +markTask: (id: number) => MarkTaskAction;
  +addSubTask: (id: number, subTask: SubTask) => AddNewSubTaskAction;
|};
type Props = {| ...OwnProps; ...SubscribedProps; ...DispatchedProps; |};

type State = {| +value: string |};

const actionCreators = {
  markTask: markTaskAction,
  addSubTask: addSubtaskAction,
};

const mapStateToProps = ({ classColorConfig, tagColorConfig }: StoreState): SubscribedProps => ({
  colorConfig: { ...classColorConfig, ...tagColorConfig },
});

class TaskBox extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  /**
   * Mark the task as complete.
   */
  markTaskAsComplete = (): void => {
    const { id, markTask } = this.props;
    markTask(id);
  };

  /**
   * Add a new subtask.
   *
   * @param {Event} event the event to signal the user action.
   */
  addNewSubtask = (event: Event) => {
    event.preventDefault();
    const { id, addSubTask } = this.props;
    const { value } = this.state;
    const subtask = {
      id: (10 * new Date()) + Math.floor(10 * Math.random()),
      name: value,
      complete: false,
      inFocus: false,
    };
    addSubTask(id, subtask);
    this.setState({ value: '' });
  };

  handleSubtaskInputChange = (event) => {
    this.setState({ value: event.target.value });
  };

  /**
   * Renders the name of the task.
   *
   * @return {Node} the rendered task name.
   */
  renderTaskName(): Node {
    const { name, complete } = this.props;
    const style = complete ? { textDecoration: 'line-through' } : {};
    return (
      <span className={styles.TaskBoxTaskText} style={style}>{name}</span>
    );
  }

  render(): Node {
    const {
      id, name, date, tag, complete, inFocus, subtaskArray, colorConfig,
    } = this.props;
    // const { value } = this.state;
    const backgroundColor = colorConfig[tag];
    const headerComponent = (
      <div className={styles.TaskBoxTagHeader}>
        <span className={styles.TaskBoxTag}>{tag}</span>
        <span className={styles.TaskBoxFlexiblePadding} />
        <span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>
      </div>
    );
    /*
    const mainTaskCheckboxComponent = (
      <CheckBox
        className={styles.TaskBoxCheckBox}
        checked={complete}
        onChange={this.markTaskAsComplete}
      />
    );
    const mainTaskNameComponent = (() => {
      const style = complete ? { textDecoration: 'line-through' } : {};
      return (
        <span className={styles.TaskBoxTaskText} style={style}>{name}</span>
      );
    })();
    const subtasksComponent = subtaskArray.map(item => (
      <SubTaskBox key={item.id} {...item} mainTaskID={id} />
    ));
    const newSubtaskComponent = (
      <div className={styles.newSubtaskDiv}>
        <form onSubmit={this.addNewSubtask}>
          <input
            type="text"
            className={styles.newSubtask}
            placeholder="New subtask"
            value={value}
            onChange={this.handleSubtaskInputChange}
          />
        </form>
      </div>
    );
    return (
      <div className={styles.TaskBox} style={{ backgroundColor }}>
        {headerComponent}
        <div className={styles.TaskBoxMainLabel}>
          {mainTaskCheckboxComponent}
          {mainTaskNameComponent}
        </div>
        {subtasksComponent}
        {newSubtaskComponent}
      </div>
    );
    */
    const task = {
      id, name, date, tag, complete, inFocus, subtaskArray,
    };
    return (
      <div className={styles.TaskBox} style={{ backgroundColor }}>
        {headerComponent}
        <InlineTaskEditor initialTask={task} />
      </div>
    );
  }
}

const ConnectedTaskBox = fullConnect<OwnProps, SubscribedProps, DispatchedProps>(
  mapStateToProps, actionCreators,
)(TaskBox);
export default ConnectedTaskBox;
