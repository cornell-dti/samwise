// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import PinFilled from '../../../assets/svgs/pin-2-dark-filled.svg';
import PinOutline from '../../../assets/svgs/pin-2-dark-outline.svg';
import DeleteDark from '../../../assets/svgs/XDark.svg';
import styles from './FutureViewTask.css';
import type { SubTask } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import { editSubTask, removeSubTask } from '../../../firebase/actions';
import { getSubTaskById } from '../../../store/selectors';

type OwnProps = {|
  +subTaskId: string;
  +mainTaskId: string;
  +mainTaskCompleted: boolean;
|};

type Props = {|
  +subTaskId: string;
  +subTask: ?SubTask;
  +mainTaskId: string;
  +mainTaskCompleted: boolean;
|};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask(
  {
    subTaskId, subTask, mainTaskId, mainTaskCompleted,
  }: Props,
): Node {
  if (subTask == null) {
    return null;
  }
  const { name, complete, inFocus } = subTask;
  const onCompleteChange = () => editSubTask(subTaskId, { complete: !complete });
  const onFocusChange = () => editSubTask(subTaskId, { inFocus: !inFocus });
  const onRemove = () => removeSubTask(mainTaskId, subTaskId);
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
      {inFocus
        ? <PinFilled onClick={onFocusChange} className={styles.TaskIcon} />
        : <PinOutline onClick={onFocusChange} className={styles.TaskIcon} />
      }
      <DeleteDark className={styles.TaskIcon} onClick={onRemove} />
    </div>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  (state, { subTaskId }) => ({ subTask: getSubTaskById(state, subTaskId) }),
)(FutureViewSubTask);
export default Connected;
