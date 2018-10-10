// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { Checkbox } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import { markSubtask } from '../../store/actions';
import type { SubTask } from '../../store/store-types';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  changeCompletionStatus: (taskId: number, subTaskId: number) => {
    dispatch(markSubtask(taskId, subTaskId));
  },
});

type Props = SubTask & {|
  mainTaskId: number;
  changeCompletionStatus: (taskId: number, subTaskId: number) => void;
|};

function BacklogSubTask(props: Props) {
  const {
    name, id, mainTaskId, complete, changeCompletionStatus,
  } = props;
  return (
    <div className={styles.BacklogSubTask}>
      <Checkbox checked={complete} onChange={() => changeCompletionStatus(mainTaskId, id)} />
      <span
        className={styles.BacklogTaskText}
        style={complete ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
    </div>
  );
}

const ConnectedBacklogSubTask = connect(null, mapDispatchToProps)(BacklogSubTask);
export default ConnectedBacklogSubTask;
