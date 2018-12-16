// @flow strict

import React from 'react';
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
import FloatingTaskEditor from '../TaskEditors/FloatingTaskEditor';
import type { SubTask } from '../../store/store-types';
import type {
  MarkTaskAction, RemoveTaskAction, ToggleTaskPinAction,
} from '../../store/action-types';
import CheckBox from '../UI/CheckBox';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';

type Props = {|
  ...ColoredTask;
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
  +markTask: (taskId: number) => MarkTaskAction;
  +toggleTaskPin: (taskId: number) => ToggleTaskPinAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
|};

const actionCreators = {
  markTask: markTaskAction,
  toggleTaskPin: toggleTaskPinAction,
  removeTask: removeTaskAction,
};

/**
 * The component used to render one task in backlog day.
 */
class BacklogTask extends React.PureComponent<Props> {
  /**
   * Get an onClickHandler when the element is clicked.
   * This methods ensure that only clicking on task text counts.
   *
   * @param {function(): void} opener the opener passed by the floating task editor.
   * @return {function} the onClick handler.
   */
  getOnClickHandler = (opener: () => void) => (event: SyntheticEvent<HTMLElement>): void => {
    if (event.target instanceof HTMLElement) {
      const elem: HTMLElement = event.target;
      // only accept click on text.
      if (elem.className === styles.BacklogTaskText) {
        opener();
      }
    }
  };

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
    const handler = () => {
      removeTask(id, true);
    };
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
        {this.renderBookmarkIcon()}
        {this.renderRemoveTaskIcon()}
      </div>
    );
  }

  /**
   * Render the information for subtasks.
   *
   * @return {Node} the information for subtasks.
   */
  renderSubTasks(): Node {
    const { id, subtaskArray, doesShowCompletedTasks } = this.props;
    return subtaskArray
      .filter((subTask: SubTask) => (doesShowCompletedTasks || !subTask.complete))
      .map((subTask: SubTask) => (
        <BacklogSubTask key={subTask.id} mainTaskId={id} {...subTask} />
      ));
  }

  render(): Node {
    const {
      inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
      markTask, toggleTaskPin, removeTask, color, ...task
    } = this.props;
    if (!inFourDaysView) {
      return (
        <div className={styles.BacklogTask}>
          {this.renderMainTaskInfo()}
        </div>
      );
    }
    // Construct the trigger for the floating task editor.
    const trigger = (opener: () => void): Node => {
      const onClickHandler = this.getOnClickHandler(opener);
      return (
        <div
          className={styles.BacklogTask}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={-1}
          onClick={onClickHandler}
          onKeyDown={onClickHandler}
        >
          {this.renderMainTaskInfo()}
          {this.renderSubTasks()}
        </div>
      );
    };
    return (
      <FloatingTaskEditor position={taskEditorPosition} initialTask={task} trigger={trigger} />
    );
  }
}

const ConnectedBackLogTask = connect(null, actionCreators)(BacklogTask);
export default ConnectedBackLogTask;
