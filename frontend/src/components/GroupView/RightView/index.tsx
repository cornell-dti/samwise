import React, { ReactElement, useState } from 'react';
import type { Group, SamwiseUserProfile } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';

type State = {
  readonly taskCreatorOpened: boolean;
  readonly assignedMember?: SamwiseUserProfile;
};

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: SamwiseUserProfile[];
};

const EditGroupNameIcon = (): ReactElement => {
  const handler = (): void => {
    console.log('edit group');
  };
  return <SamwiseIcon iconName="pencil" className={styles.EditGroupNameIcon} onClick={handler} />;
};

const RightView = ({ group, groupMemberProfiles }: Props): ReactElement => {
  const [{ taskCreatorOpened, assignedMember }, setState] = useState<State>({
    taskCreatorOpened: false,
    assignedMember: undefined,
  });

  const openTaskCreator = (member: SamwiseUserProfile): void =>
    setState({
      taskCreatorOpened: !taskCreatorOpened,
      assignedMember: member,
    });

  const clearAssignedMember = (): void =>
    setState({ taskCreatorOpened, assignedMember: undefined });

  return (
    <div className={styles.RightView}>
      <div className={styles.GroupTaskCreator}>
        <TaskCreator
          view="group"
          group={group.name}
          groupMemberProfiles={groupMemberProfiles}
          taskCreatorOpened={taskCreatorOpened}
          assignedMember={assignedMember}
          clearAssignedMember={clearAssignedMember}
        />
      </div>

      <div className={styles.RightView}>
        <div>
          <h2>{group.name}</h2>
          <EditGroupNameIcon />
        </div>
        <div className={styles.GroupTaskRowContainer}>
          {groupMemberProfiles.map((samwiseUserProfile) => (
            <GroupTaskRow
              onClick={openTaskCreator}
              memberName={samwiseUserProfile.name}
              userProfile={samwiseUserProfile}
              key={samwiseUserProfile.email}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightView;
