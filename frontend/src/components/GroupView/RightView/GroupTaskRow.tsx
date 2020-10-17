import React, { ReactElement, SyntheticEvent, KeyboardEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Task } from 'common/types/store-types';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './GroupTaskRow.module.scss';
import ProfileImage from '../MiddleBar/ProfileImage';

type Props = {
  readonly memberName: string;
  readonly tasks: readonly Task[];
  readonly profilePicURL: string;
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

const GroupTaskRow = ({ tasks, memberName, profilePicURL }: Props): ReactElement => {
  return (
    <div className={styles.GroupTaskRow}>
      <ProfileImage
        className={styles.ProfilePicGroupView}
        memberName={memberName}
        imageURL={profilePicURL}
      />

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

      <GroupTasksContainer tasks={tasks} memberName={memberName} />
    </div>
  );
};

export default GroupTaskRow;
