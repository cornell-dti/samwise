// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import styles from './FutureViewTask.css';
import type { SubTask } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import { editSubTask, removeSubTask } from '../../../firebase/actions';
import { getSubTaskById } from '../../../util/task-util';

type OwnProps = {|
  +subTaskId: string;
  +mainTaskCompleted: boolean;
|};

type Props = {|
  +subTaskId: string;
  +subTask: SubTask;
  +mainTaskCompleted: boolean;
|};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask({ subTaskId, subTask, mainTaskCompleted }: Props): Node {
  const { name, complete, inFocus } = subTask;
  const onCompleteChange = () => editSubTask(subTaskId, { complete: !complete });
  const onFocusChange = () => editSubTask(subTaskId, { inFocus: !inFocus });
  const onRemove = () => removeSubTask(subTaskId);
  return (
    <div className={styles.SubTask}>
      <CheckBox
        className={styles.TaskCheckBox}
        checked={mainTaskCompleted || complete}
        disabled={mainTaskCompleted}
        inverted
        onChange={onCompleteChange}
      />
      <span
        className={styles.TaskText}
        style={(mainTaskCompleted || complete) ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <Icon
        name={inFocus ? 'bookmark' : 'bookmark outline'}
        className={styles.TaskIcon}
        onClick={onFocusChange}
      />
      <Icon name="delete" className={styles.TaskIcon} onClick={onRemove} />
    </div>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  ({ subTasks }, { subTaskId }) => getSubTaskById(subTasks, subTaskId)
)(FutureViewSubTask);
export default Connected;
