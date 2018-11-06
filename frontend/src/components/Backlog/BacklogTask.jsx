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
 *
 * @param props the props to render.
 * @return {Node} the rendered element.
 * @constructor
 */
function BacklogTask(props: Props): Node {
  const {
    color, doesShowCompletedTasks, doesRenderSubTasks,
    markTask, toggleTaskPin, removeTask, ...task
  } = props;
  const {
    name, id, complete, inFocus, subtaskArray,
  } = task;
  const subTasks = doesRenderSubTasks && subtaskArray
    .filter((t: SubTask) => (doesShowCompletedTasks || !t.complete))
    .map((subTask: SubTask) => (
      <BacklogSubTask key={subTask.id} mainTaskId={id} {...subTask} />
    ));
  const trigger = (opener: (task: Task, backgroundColor: string) => void): Node => {
    const onClickHandler = (e: SyntheticEvent<HTMLElement>) => {
      // only accept click on text.
      if (e.target instanceof HTMLElement) {
        const elem: HTMLElement = e.target;
        if (elem.className === styles.BacklogTaskText) {
          opener(task, color);
        }
      }
    };
    return (
      <div onClick={onClickHandler} className={styles.BacklogTask}>
        <div className={styles.BacklogTaskMainWrapper} style={{ backgroundColor: color }}>
          <CheckBox
            className={styles.BacklogTaskCheckBox}
            checked={complete}
            onChange={() => markTask(id)}
          />
          <span
            className={styles.BacklogTaskText}
            style={complete ? { textDecoration: 'line-through' } : {}}
          >
            {name}
          </span>
          <Icon
            name="delete"
            className={styles.BacklogTaskIcon}
            onClick={() => removeTask(id)}
          />
          <Icon
            name={inFocus ? 'bookmark' : 'bookmark outline'}
            className={styles.BacklogTaskIcon}
            onClick={() => toggleTaskPin(id)}
          />
        </div>
        {subTasks}
      </div>
    );
  };
  return (
    <FloatingTaskEditor trigger={trigger} />
  );
}

const ConnectedBackLogTask = connect(null, actionCreators)(BacklogTask);
export default ConnectedBackLogTask;
