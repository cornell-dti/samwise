// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { Checkbox } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import type { SimpleTask } from './types';
import { markTask } from '../../store/actions';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  changeCompletionStatus: (taskId: number) => dispatch(markTask(taskId)),
});

type Props = SimpleTask & {|changeCompletionStatus: (taskId: number) => void|};

function BacklogTask({
  name, id, color, complete, changeCompletionStatus,
}: Props) {
  return (
    <div className={styles.BacklogTask} style={{ backgroundColor: color }}>
      <Checkbox checked={complete} onChange={() => changeCompletionStatus(id)} />
      <span
        className={styles.BacklogTaskText}
        style={complete ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
    </div>
  );
}

const ConnectedBackLogTask = connect(null, mapDispatchToProps)(BacklogTask);
export default ConnectedBackLogTask;
