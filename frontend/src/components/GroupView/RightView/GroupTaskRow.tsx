import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SamwiseUserProfile, Task } from 'common/types/store-types';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './GroupTaskRow.module.scss';
import ProfileImage from '../MiddleBar/ProfileImage';

type Props = {
  readonly memberName: string;
  readonly userProfile: SamwiseUserProfile;
  readonly onClick: (member: SamwiseUserProfile[]) => void;
  readonly tasks: readonly Task[];
  readonly profilePicURL: string;
};

const GroupTaskRow = ({
  tasks,
  memberName,
  profilePicURL,
  userProfile,
  onClick,
}: Props): ReactElement => {
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
        onClick={() => onClick([userProfile])}
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
