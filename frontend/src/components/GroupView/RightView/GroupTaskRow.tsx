import React, { ReactElement, KeyboardEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SamwiseUserProfile, Task } from 'common/types/store-types';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './GroupTaskRow.module.scss';
import ProfileImage from '../MiddleBar/ProfileImage';

type Props = {
  readonly memberName: string;
  readonly userProfile: SamwiseUserProfile;
  readonly onClick: (member: SamwiseUserProfile) => void;
  readonly tasks: readonly Task[];
  readonly profilePicURL: string;
};

const pressedAddGroupTask = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.stopPropagation();
    console.log('pressed add group task');
  }
};

const GroupTaskRow = ({ tasks, memberName, profilePicURL, userProfile, onClick }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;
    
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
        onClick={() => onClick(userProfile)}
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
