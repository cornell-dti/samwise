import React, { ReactElement } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly tasks: Task[];
};

const EditGroupNameIcon = (): ReactElement => {
  const handler = (): void => {
    console.log('edit group');
  };
  return <SamwiseIcon iconName="pencil" className={styles.EditGroupNameIcon} onClick={handler} />;
};

const RightView = ({ group, groupMemberProfiles, tasks }: Props): ReactElement => {
  return (
    <div className={styles.RightView}>
      <div className={styles.GroupTaskCreator}>
        <TaskCreator view="group" group={group.name} />
      </div>

      <div className={styles.RightView}>
        <div>
          <h2>{group.name}</h2>
          <EditGroupNameIcon />
        </div>
        <div className={styles.GroupTaskRowContainer}>
          {groupMemberProfiles.map((samwiseUserProfile) => {
            const filteredTasks = tasks.filter((t) => t.owner === samwiseUserProfile.email);
            return (
              <GroupTaskRow
                tasks={filteredTasks}
                memberName={samwiseUserProfile.name}
                key={samwiseUserProfile.email}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightView;
