// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import {
  Checkbox, Icon, Modal, Header,
} from 'semantic-ui-react';
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
        <Modal trigger={<Icon name="edit" />}>
          <Modal.Header>Task Editor</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <PopupTaskEditor
                name={name}
                id={id}
                tag={tag}
                date={date}
                complete={complete}
                subtaskArray={subtaskArray}
              />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
      {
        subtaskArray.map(subTask => (<BacklogSubTask key={id} mainTaskId={id} {...subTask} />))
      }
    </div>
  );
}

const ConnectedBackLogTask = connect(null, mapDispatchToProps)(BacklogTask);
export default ConnectedBackLogTask;
