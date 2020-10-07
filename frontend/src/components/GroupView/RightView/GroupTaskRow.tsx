import React, { ReactElement, SyntheticEvent, KeyboardEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Task } from 'common/types/store-types';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './GroupTaskRow.module.scss';

type Props = {
  memberName: string;
  readonly tasks: Task[];
};

const clickAddGroupTask = (e: SyntheticEvent<HTMLElement>): void => {
  e.stopPropagation();
  console.log('clicked add group task');
};
const pressedAddGroupTask = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.stopPropagation();
    console.log('pressed add group task');
  }
};

const GroupTaskRow = ({ tasks, memberName }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;

  return (
    <div className={styles.GroupTaskRow}>
      <div className={styles.Initials}>{initials}</div>

      <button
        type="button"
        className={styles.AddTaskContainer}
        onClick={clickAddGroupTask}
        onKeyPress={pressedAddGroupTask}
      >
        <div className={styles.AddTask}>
          <FontAwesomeIcon icon={faPlus} />
          <h3>Assign new task</h3>
        </div>
      </button>

      <GroupTasksContainer tasks={tasks} />
    </div>
  );
};

export default GroupTaskRow;
