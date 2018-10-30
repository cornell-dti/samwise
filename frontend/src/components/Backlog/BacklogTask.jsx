// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { Checkbox, Icon } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import type { ColoredTask } from './backlog-types';
import { markTask } from '../../store/actions';
import BacklogSubTask from './BacklogSubTask';
import PopupTaskEditor from '../PopupTaskEditor/PopupTaskEditor';

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  changeCompletionStatus: (taskId: number) => dispatch(markTask(taskId)),
});

type Props = {|
  ...ColoredTask;
  +changeCompletionStatus: (taskId: number) => void;
|};

function BacklogTask(props: Props) {
  const {
    name, id, tag, date, color, complete, subtaskArray, changeCompletionStatus,
  } = props;
  const task = {
    name, id, tag, date, complete, subtaskArray,
  };
  const subTasks = subtaskArray
    .map(subTask => (<BacklogSubTask key={subTask.id} mainTaskId={id} {...subTask} />));
  return (
    <div className={styles.BacklogTask} style={{ backgroundColor: color }}>
      <div className={styles.BacklogTaskMainWrapper}>
        <Checkbox
          className={styles.BacklogTaskCheckBox}
          checked={complete}
          onChange={() => changeCompletionStatus(id)}
        />
        <span
          className={styles.BacklogTaskText}
          style={complete ? { textDecoration: 'line-through' } : {}}
        >
          {name}
        </span>
        <PopupTaskEditor trigger={opener => (<Icon name="edit" onClick={opener} />)} {...task} />
      </div>
      {subTasks}
    </div>
  );
}

const ConnectedBackLogTask = connect(null, mapDispatchToProps)(BacklogTask);
export default ConnectedBackLogTask;
