// @flow strict

import * as React from 'react';
import { connect } from 'react-redux';
import { Checkbox, Icon } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import styles from './BacklogTask.css';
import type { ColoredTask } from './backlog-types';
import {
  markTask as markTaskAction,
  removeTask as removeTaskAction,
  toggleTaskPin as toggleTaskPinAction,
} from '../../store/actions';
import BacklogSubTask from './BacklogSubTask';
import PopupTaskEditor from '../PopupTaskEditor/PopupTaskEditor';
import type { SubTask } from '../../store/store-types';
import type {
  Dispatch, MarkTaskAction, RemoveTaskAction, ToggleTaskPinAction,
} from '../../store/action-types';

type Props = {|
  ...ColoredTask;
  +markTask: (taskId: number) => MarkTaskAction;
  +toggleTaskPin: (taskId: number) => ToggleTaskPinAction;
  +removeTask: (taskId: number) => RemoveTaskAction;
|};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  markTask: markTaskAction,
  toggleTaskPin: toggleTaskPinAction,
  removeTask: removeTaskAction,
}, dispatch);

/**
 * The component used to render one task in backlog day.
 *
 * @param props the props to render.
 * @return {*} the rendered element.
 * @constructor
 */
function BacklogTask(props: Props) {
  const {
    color, markTask, toggleTaskPin, removeTask, ...task
  } = props;
  const {
    name, id, complete, inFocus, subtaskArray,
  } = task;
  const subTasks = subtaskArray.map((subTask: SubTask) => (
    <BacklogSubTask key={subTask.id} mainTaskId={id} {...subTask} />
  ));
  return (
    <div className={styles.BacklogTask} style={{ backgroundColor: color }}>
      <div className={styles.BacklogTaskMainWrapper}>
        <Checkbox
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
        <Icon name="delete calendar" onClick={() => removeTask(id)} />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          onClick={() => toggleTaskPin(id)}
        />
        <PopupTaskEditor trigger={opener => (<Icon name="edit" onClick={opener} />)} {...task} />
      </div>
      {subTasks}
    </div>
  );
}

const ConnectedBackLogTask = connect(null, mapDispatchToProps)(BacklogTask);
export default ConnectedBackLogTask;
