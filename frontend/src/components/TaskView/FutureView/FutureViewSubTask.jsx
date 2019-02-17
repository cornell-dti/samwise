// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './FutureViewTask.css';
import type { PartialSubTask, SubTask } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import { editSubTask, removeSubTask } from '../../../firebase/actions';

type Props = {|
  ...SubTask;
  +mainTaskCompleted: boolean;
|};

/**
 * The component used to render one subtask in future view day.
 */
export default function FutureViewSubTask(
  {
    name, id, complete, inFocus, mainTaskCompleted,
  }: Props,
): Node {
  const onCompleteChange = () => editSubTask(id, { complete: !complete });
  const onFocusChange = () => editSubTask(id, { inFocus: !inFocus });
  const onRemove = () => removeSubTask(id);
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
