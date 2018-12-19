// @flow strict

import React from 'react';
import type { Node } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import styles from './FutureViewTask.css';
import type { ColoredTask } from './future-view-types';
import {
  editMainTask as editMainTaskAction,
  removeTask as removeTaskAction,
} from '../../../store/actions';
import FutureViewSubTask from './FutureViewSubTask';
import FloatingTaskEditor from '../../Util/TaskEditors/FloatingTaskEditor';
import type { PartialMainTask, SubTask } from '../../../store/store-types';
import type { EditMainTaskAction, RemoveTaskAction } from '../../../store/action-types';
import CheckBox from '../../UI/CheckBox';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';

type Props = {|
  ...ColoredTask;
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
  +editMainTask: (taskId: number, partialMainTask: PartialMainTask) => EditMainTaskAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
|};

/**
 * The component used to render one task in backlog day.
 */
class FutureViewTask extends React.PureComponent<Props> {
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
      if (elem.className === styles.TaskText) {
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
    const { id, complete, editMainTask } = this.props;
    return (
      <CheckBox
        className={styles.TaskCheckBox}
        checked={complete}
        onChange={() => editMainTask(id, { complete: !complete })}
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
      <span className={styles.TaskText} style={tagStyle}>{name}</span>
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
      <Icon name="delete" className={styles.TaskIcon} onClick={handler} />
    );
  }

  /**
   * Render the bookmark task icon.
   *
   * @return {Node} the rendered bookmark task icon.
   */
  renderBookmarkIcon(): Node {
    const { id, inFocus, editMainTask } = this.props;
    return (
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.TaskIcon}
        onClick={() => editMainTask(id, { inFocus: !inFocus })}
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
      <div className={styles.TaskMainWrapper} style={{ backgroundColor: color }}>
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
    const {
      id, complete, subtaskArray, doesShowCompletedTasks,
    } = this.props;
    return subtaskArray
      .filter((subTask: SubTask) => (doesShowCompletedTasks || !subTask.complete))
      .map((subTask: SubTask) => (
        <FutureViewSubTask
          key={subTask.id}
          mainTaskId={id}
          mainTaskCompleted={complete}
          {...subTask}
        />
      ));
  }

  render(): Node {
    const {
      inFourDaysView, doesShowCompletedTasks, taskEditorPosition,
      editMainTask, removeTask, color, ...task
    } = this.props;
    if (!inFourDaysView) {
      return (
        <div className={styles.Task}>
          {this.renderMainTaskInfo()}
        </div>
      );
    }
    // Construct the trigger for the floating task editor.
    const trigger = (opener: () => void): Node => {
      const onClickHandler = this.getOnClickHandler(opener);
      return (
        <div
          className={styles.Task}
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

const ConnectedFutureViewTask = connect(
  null,
  { editMainTask: editMainTaskAction, removeTask: removeTaskAction },
)(FutureViewTask);
export default ConnectedFutureViewTask;
