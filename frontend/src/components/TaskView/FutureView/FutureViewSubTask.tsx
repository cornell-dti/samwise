import React, { ReactElement } from 'react';
import styles from './FutureViewTask.module.css';
import { SubTask } from '../../../store/store-types';
import CheckBox from '../../UI/CheckBox';
import { editSubTask, removeSubTask } from '../../../firebase/actions';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly subTask: SubTask;
  readonly mainTaskId: string;
  readonly mainTaskEditType: 'EDITING_ONE_TIME_TASK' | 'FORKING_MASTER_TEMPLATE';
  readonly mainTaskCompleted: boolean;
};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask(
  { subTask, mainTaskId, mainTaskEditType, mainTaskCompleted }: Props,
): ReactElement | null {
  if (subTask == null) {
    return null;
  }
  const { name, complete, inFocus } = subTask;
  const onCompleteChange = (): void => editSubTask(
    mainTaskId, subTask.id, mainTaskEditType, { complete: !complete },
  );
  const onFocusChange = (): void => editSubTask(
    mainTaskId, subTask.id, mainTaskEditType, { inFocus: !inFocus },
  );
  const onRemove = (): void => removeSubTask(mainTaskId, subTask.id, mainTaskEditType);
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
