import React, { ReactElement } from 'react';
import { SubTask } from 'common/types/store-types';
import styles from './FutureViewTask.module.scss';
import CheckBox from '../../UI/CheckBox';
import { editSubTask, removeSubTask } from '../../../firebase/actions';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly subTask: SubTask | null;
  readonly mainTaskId: string;
  readonly replaceDateForFork: Date | null;
  readonly mainTaskCompleted: boolean;
};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask({
  subTask,
  mainTaskId,
  replaceDateForFork,
  mainTaskCompleted,
}: Props): ReactElement | null {
  if (subTask == null) {
    return null;
  }
  const { name, complete, inFocus } = subTask;
  const onCompleteChange = (): void =>
    editSubTask(mainTaskId, subTask.id, replaceDateForFork, { complete: !complete });
  const onFocusChange = (): void =>
    editSubTask(mainTaskId, subTask.id, replaceDateForFork, { inFocus: !inFocus });
  const onRemove = (): void => removeSubTask(mainTaskId, subTask.id, replaceDateForFork);
  return (
    <div className={styles.SubTask}>
      <CheckBox
        className={styles.SubTaskCheckBox}
        checked={mainTaskCompleted || complete}
        disabled={mainTaskCompleted}
        inverted
        onChange={onCompleteChange}
      />
      <span
        className={styles.TaskText}
        style={mainTaskCompleted || complete ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
      <SamwiseIcon
        iconName={inFocus ? 'pin-dark-filled' : 'pin-dark-outline'}
        onClick={onFocusChange}
        className={styles.TaskIcon}
      />
      <SamwiseIcon iconName="x-dark" className={styles.TaskIcon} onClick={onRemove} />
    </div>
  );
}

const Memoized = React.memo(FutureViewSubTask);
export default Memoized;
