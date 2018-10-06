// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { Checkbox } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import type { SimpleTask } from './backlog-types';
import { markTask } from '../../store/actions';
import BacklogSubTask from './BacklogSubTask';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  changeCompletionStatus: (taskId: number) => dispatch(markTask(taskId)),
});

type Props = SimpleTask & {| changeCompletionStatus: (taskId: number) => void |};

function BacklogTask(props: Props) {
  const {
    name, id, color, complete, subTasks, changeCompletionStatus,
  } = props;
  return (
    <div className={styles.BacklogTask} style={{ backgroundColor: color }}>
      <div className={styles.BacklogTaskMainWrapper}>
        <Checkbox checked={complete} onChange={() => changeCompletionStatus(id)} />
        <span
          className={styles.BacklogTaskText}
          style={complete ? { textDecoration: 'line-through' } : {}}
        >
          {name}
        </span>
      </div>
      {
        subTasks.map(subTask => (<BacklogSubTask key={id} mainTaskId={id} {...subTask} />))
      }
    </div>
  );
}

const ConnectedBackLogTask = connect(null, mapDispatchToProps)(BacklogTask);
export default ConnectedBackLogTask;
