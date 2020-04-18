import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './index.module.css';

type Props = {
  memberName: string;
}

export default ({ memberName }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;

  return (
    <div className={styles.GroupTaskRow}>
      <div className={styles.Initials}>{initials}</div>

      <div className={styles.AddTaskContainer}>
        <div className={styles.AddTask}>
          <FontAwesomeIcon icon={faPlus} />
          <h3>Assign new task</h3>
        </div>
      </div>

      <GroupTasksContainer />
    </div>
  );
};
