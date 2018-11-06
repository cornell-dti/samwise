// @flow strict
/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */

import * as React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import type { ColoredTask } from './backlog-types';
import {
  markTask as markTaskAction,
  removeTask as removeTaskAction,
  toggleTaskPin as toggleTaskPinAction,
} from '../../store/actions';
import BacklogSubTask from './BacklogSubTask';
import FloatingTaskEditor from '../FloatingTaskEditor/FloatingTaskEditor';
import type { SubTask, Task } from '../../store/store-types';
import type {
  MarkTaskAction, RemoveTaskAction, ToggleTaskPinAction,
} from '../../store/action-types';
import CheckBox from '../UI/CheckBox';

type Props = {|
  ...ColoredTask;
  +doesShowCompletedTasks: boolean;
  +doesRenderSubTasks: boolean;
  +markTask: (taskId: number) => MarkTaskAction;
  +toggleTaskPin: (taskId: number) => ToggleTaskPinAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
|};

const actionCreators = {
  markTask: markTaskAction,
  toggleTaskPin: toggleTaskPinAction,
  removeTask: removeTaskAction,
};

/**
 * The component used to render one task in backlog day.
 */
class BacklogTask extends React.Component<Props> {
  /**
   * Get an onClickHandler when the element is clicked.
   * This methods ensure that only clicking on task text counts.
   *
   * @param {Function} opener the opener passed by the floating task editor.
   * @return {Function} the onClick handler.
   */
  getOnClickHandler(opener: (Task, string) => void): (SyntheticEvent<HTMLElement>) => void {
    const {
      color, doesShowCompletedTasks, doesRenderSubTasks,
      markTask, toggleTaskPin, removeTask, ...task
    } = this.props;
    return (event: SyntheticEvent<HTMLElement>) => {
      if (event.target instanceof HTMLElement) {
        const elem: HTMLElement = event.target;
        // only accept click on text.
        if (elem.className === styles.BacklogTaskText) {
          opener(task, color);
        }
      }
    };
  }

  /**
   * Render the checkbox element.
   *
   * @return {Node} the checkbox element.
   */
  renderCheckBox(): Node {
    const { id, complete, markTask } = this.props;
    return (
      <CheckBox
        className={styles.BacklogTaskCheckBox}
        checked={complete}
        onChange={() => markTask(id)}
      />
    );
  }

  /**
   * Render the task name.
   *
   * @return {Node} the task name element.
   */
  renderTaskName(): Node {
    const { name, complete } = this.props;
    const tagStyle = complete ? { textDecoration: 'line-through' } : {};
    return (
      <span className={styles.BacklogTaskText} style={tagStyle}>{name}</span>
    );
  }

  /**
   * Render the remove task icon.
   *
   * @return {Node} the rendered remove task icon.
   */
  renderRemoveTaskIcon(): Node {
    const { id, removeTask } = this.props;
    const handler = () => removeTask(id);
    return (
      <Icon name="delete" className={styles.BacklogTaskIcon} onClick={handler} />
    );
  }

  /**
   * Render the bookmark task icon.
   *
   * @return {Node} the rendered bookmark task icon.
   */
  renderBookmarkIcon(): Node {
    const { id, inFocus, toggleTaskPin } = this.props;
    const handler = () => toggleTaskPin(id);
    return (
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.BacklogTaskIcon}
        onClick={handler}
      />
    );
  }

  /**
   * Render the information for main task.
   *
   * @return {Node} the information for main task.
   */
  renderMainTaskInfo(): Node {
    const { color } = this.props;
    return (
      <div className={styles.BacklogTaskMainWrapper} style={{ backgroundColor: color }}>
        {this.renderCheckBox()}
        {this.renderTaskName()}
        {this.renderRemoveTaskIcon()}
        {this.renderBookmarkIcon()}
      </div>
    );
  }

  /**
   * Render the information for subtasks.
   *
   * @return {Node} the information for subtasks.
   */
  renderSubTasks(): Node {
    const {
      id, subtaskArray, doesShowCompletedTasks, doesRenderSubTasks,
    } = this.props;
    return doesRenderSubTasks && subtaskArray
      .filter((subTask: SubTask) => (doesShowCompletedTasks || !subTask.complete))
      .map((subTask: SubTask) => (
        <BacklogSubTask key={subTask.id} mainTaskId={id} {...subTask} />
      ));
  }

  render(): Node {
    // Construct the trigger for the floating task editor.
    const trigger = (opener: (Task, string) => void): Node => {
      const onClickHandler = this.getOnClickHandler(opener);
      return (
        <div onClick={onClickHandler} className={styles.BacklogTask}>
          {this.renderMainTaskInfo()}
          {this.renderSubTasks()}
        </div>
      );
    };
    return (<FloatingTaskEditor mountInside trigger={trigger} />);
  }
}

const ConnectedBackLogTask = connect(null, actionCreators)(BacklogTask);
export default ConnectedBackLogTask;
