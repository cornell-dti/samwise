import React, { ReactElement, SyntheticEvent, KeyboardEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './index.module.css';

type Props = {
  memberName: string;
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

export default ({ memberName }: Props): ReactElement => {
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

      <GroupTasksContainer />
    </div>
  );
};
