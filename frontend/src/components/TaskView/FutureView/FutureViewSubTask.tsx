import React, { ReactElement } from 'react';
import { SubTask, Task, TaskMetadata } from 'common/types/store-types';
import { subTasksEqual } from 'common/util/task-util';
import styles from './FutureViewTask.module.scss';
import CheckBox from '../../UI/CheckBox';
import { editTaskWithDiff } from '../../../firebase/actions';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = {
  readonly subTask: SubTask | null;
  readonly taskData: Task<TaskMetadata>;
  readonly mainTaskCompleted: boolean;
};

/**
 * The component used to render one subtask in future view day.
 */
function FutureViewSubTask({ subTask, taskData, mainTaskCompleted }: Props): ReactElement | null {
  if (subTask == null) {
    return null;
  }
  const onCompleteChange = (): void =>
    editTaskWithDiff(taskData.id, 'EDITING_ONE_TIME_TASK', {
      mainTaskEdits: {
        children: taskData.children.map(({ complete, ...rest }) =>
          subTasksEqual({ complete, ...rest }, subTask)
            ? { complete: !complete, ...rest }
            : { complete, ...rest }
        ),
      },
    });
  const onFocusChange = (): void =>
    editTaskWithDiff(taskData.id, 'EDITING_ONE_TIME_TASK', {
      mainTaskEdits: {
        children: taskData.children.map(({ inFocus, ...rest }) =>
          subTasksEqual({ inFocus, ...rest }, subTask)
            ? { inFocus: !inFocus, ...rest }
            : { inFocus, ...rest }
        ),
      },
    });
  const onRemove = (): void =>
    editTaskWithDiff(taskData.id, 'EDITING_ONE_TIME_TASK', {
      mainTaskEdits: {
        children: taskData.children.filter((currSubTask) => !subTasksEqual(currSubTask, subTask)),
      },
    });
  return (
    <div className={styles.SubTask}>
      <CheckBox
        className={styles.SubTaskCheckBox}
        checked={mainTaskCompleted || subTask.complete}
        disabled={mainTaskCompleted}
        inverted
        onChange={onCompleteChange}
      />
      <span
        className={styles.TaskText}
        style={mainTaskCompleted || subTask.complete ? { textDecoration: 'line-through' } : {}}
      >
        {subTask.name}
      </span>
      <SamwiseIcon
        iconName={subTask.inFocus ? 'pin-dark-filled' : 'pin-dark-outline'}
        onClick={onFocusChange}
        className={styles.TaskIcon}
      />
      <SamwiseIcon iconName="x-dark" className={styles.TaskIcon} onClick={onRemove} />
    </div>
  );
}

const Memoized = React.memo(FutureViewSubTask);
export default Memoized;
