// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { Checkbox, Icon } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import { markSubtask, removeSubTask, toggleSubTaskPin } from '../../store/actions';
import type { SubTask } from '../../store/store-types';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  changeCompletionStatus: (taskId: number, subTaskId: number) => {
    dispatch(markSubtask(taskId, subTaskId));
  },
  changeInFocusStatus: (taskId: number, subTaskId: number) => {
    dispatch(toggleSubTaskPin(taskId, subTaskId));
  },
  removeMe: (taskId: number, subTaskId: number) => {
    dispatch(removeSubTask(taskId, subTaskId));
  },
});

type Props = {|
  ...SubTask;
  +mainTaskId: number;
  +changeCompletionStatus: (taskId: number, subTaskId: number) => void;
  +changeInFocusStatus: (taskId: number, subTaskId: number) => void;
  +removeMe: (taskId: number, subTaskId: number) => void;
|};

function BacklogSubTask(props: Props) {
  const {
    name, id, mainTaskId, complete, inFocus,
    changeCompletionStatus, changeInFocusStatus, removeMe,
  } = props;
  return (
    <div className={styles.BacklogSubTask}>
      <Checkbox
        className={styles.BacklogTaskCheckBox}
        checked={complete}
        onChange={() => changeCompletionStatus(mainTaskId, id)}
      />
      <span
        className={styles.BacklogTaskText}
        style={complete ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <Icon name="delete" onClick={() => removeMe(mainTaskId, id)} />
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        onClick={() => changeInFocusStatus(mainTaskId, id)}
      />
    </div>
  );
}

const ConnectedBacklogSubTask = connect(null, mapDispatchToProps)(BacklogSubTask);
export default ConnectedBacklogSubTask;
