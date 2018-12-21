// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './FutureViewTask.css';
import {
  editMainTask as editMainTaskAction,
  removeTask as removeTaskAction,
} from '../../../store/actions';
import FutureViewSubTask from './FutureViewSubTask';
import FloatingTaskEditor from '../../Util/TaskEditors/FloatingTaskEditor';
import type { PartialMainTask, SubTask, Task } from '../../../store/store-types';
import type { EditMainTaskAction, RemoveTaskAction } from '../../../store/action-types';
import CheckBox from '../../UI/CheckBox';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import { getTodayAtZero } from '../../../util/datetime-util';
import OverdueAlert from '../../UI/OverdueAlert';
import windowSizeConnect from '../../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../../Util/Responsive/window-size-context';
import { nDaysViewHeaderHeight, otherViewsHeightHeader } from './future-view-css-props';
import { error } from '../../../util/general-util';
import { dispatchConnect } from '../../../store/react-redux-util';
import type { PropsWithoutWindowSize } from '../../Util/Responsive/WindowSizeConsumer';

type Props = {|
  +originalTask: Task;
  +filteredTask: Task;
  +taskColor: string;
  +inNDaysView: boolean;
  +isInMainList: boolean;
  +taskEditorPosition: FloatingPosition;
  // Subscribed window size
  +windowSize: WindowSize;
  // Subscribed from dispatchers.
  +editMainTask: (taskId: number, partialMainTask: PartialMainTask) => EditMainTaskAction;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
|};

type State = {|
  +overdueAlertPosition: ?{| +top: number; +right: number; |};
|};

/**
 * The component used to render one task in backlog day.
 */
class FutureViewTask extends React.PureComponent<Props, State> {
  state: State = { overdueAlertPosition: null };

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
    const { filteredTask: { id, complete }, editMainTask } = this.props;
    return (
      <CheckBox
        className={styles.TaskCheckBox}
        checked={complete}
        onChange={() => { editMainTask(id, { complete: !complete }); }}
      />
    );
  }

  /**
   * Render the task name.
   *
   * @return {Node} the task name element.
   */
  renderTaskName(): Node {
    const { filteredTask: { name, complete } } = this.props;
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
    const { filteredTask: { id }, removeTask } = this.props;
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
    const { filteredTask: { id, inFocus }, editMainTask } = this.props;
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
   * @param {boolean} simplified whether to render the simplifies task.
   * @return {Node} the information for main task.
   */
  renderMainTaskInfo(simplified: boolean = false): Node {
    const { taskColor, isInMainList } = this.props;
    if (simplified && isInMainList) {
      const style = { backgroundColor: taskColor, height: '25px' };
      return <div className={styles.TaskMainWrapper} style={style} />;
    }
    return (
      <div className={styles.TaskMainWrapper} style={{ backgroundColor: taskColor }}>
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
    const { filteredTask: { id, complete, subtaskArray } } = this.props;
    return subtaskArray.map((subTask: SubTask) => (
      <FutureViewSubTask
        key={subTask.id}
        mainTaskId={id}
        mainTaskCompleted={complete}
        {...subTask}
      />
    ));
  }

  render(): Node {
    const { inNDaysView, taskEditorPosition, originalTask } = this.props;
    const { date } = originalTask;
    const { overdueAlertPosition } = this.state;
    const overdueComponentOpt = overdueAlertPosition && (
      <OverdueAlert absolutePosition={overdueAlertPosition} />
    );
    const refHandler = (divElement: HTMLDivElement | null) => {
      if (divElement != null) {
        const isOverdue = date < getTodayAtZero();
        if (isOverdue && overdueAlertPosition == null) {
          const { top } = divElement.getBoundingClientRect();
          const parent = divElement.parentElement ?? error('Corrupted DOM!');
          const parentRect = parent.getBoundingClientRect();
          const headerHeight = inNDaysView ? nDaysViewHeaderHeight : otherViewsHeightHeader;
          this.setState({
            overdueAlertPosition: {
              top: top - parentRect.top + headerHeight - 3,
              right: -5,
            },
          });
        }
      }
    };
    if (!inNDaysView) {
      const { windowSize: { width } } = this.props;
      return (
        <div className={styles.Task} ref={refHandler}>
          {overdueComponentOpt}
          {this.renderMainTaskInfo(width <= 768)}
        </div>
      );
    }
    // Construct the trigger for the floating task editor.
    const trigger = (opened: boolean, opener: () => void): Node => {
      const onClickHandler = this.getOnClickHandler(opener);
      const style = opened ? { zIndex: 8 } : {};
      return (
        <div
          role="presentation"
          className={styles.Task}
          style={style}
          onClick={onClickHandler}
          ref={refHandler}
        >
          {overdueComponentOpt}
          {this.renderMainTaskInfo()}
          {this.renderSubTasks()}
        </div>
      );
    };
    return (
      <FloatingTaskEditor
        position={taskEditorPosition}
        initialTask={originalTask}
        trigger={trigger}
      />
    );
  }
}

const actionsCreators = { editMainTask: editMainTaskAction, removeTask: removeTaskAction };
const Connected = dispatchConnect<PropsWithoutWindowSize<Props>, typeof actionsCreators>(
  actionsCreators,
)(windowSizeConnect<Props>(FutureViewTask));
export default Connected;
