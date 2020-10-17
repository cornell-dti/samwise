import React, { ReactElement, useState } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';
import { promptTextInput } from '../../Util/Modals';
import { updateGroup } from '../../../firebase/actions';

type State = {
  readonly taskCreatorOpened: boolean;
  readonly assignedMember?: SamwiseUserProfile;
};

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: SamwiseUserProfile[];
  readonly tasks: readonly Task[];
};

const RightView = ({ group, groupMemberProfiles, tasks }: Props): ReactElement => {
  const [{ taskCreatorOpened, assignedMember }, setState] = useState<State>({
    taskCreatorOpened: false,
    assignedMember: undefined,
  });

  const onEditGroupNameClicked = (): void => {
    promptTextInput('Edit your group name', '', 'New Group Name', 'Submit', 'text').then((name) =>
      updateGroup({ ...group, name })
    );
  };

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
          <SamwiseIcon
            iconName="pencil"
            className={styles.EditGroupNameIcon}
            onClick={onEditGroupNameClicked}
          />
        </div>
        <div className={styles.GroupTaskRowContainer}>
          {groupMemberProfiles.map((user) => {
            const filteredTasks = tasks.filter((t) => t.owner === user.email);
            return (
              <GroupTaskRow
                key={user.email}
                memberName={user.name}
                userProfile={user}
                onClick={openTaskCreator}
                tasks={filteredTasks}
                profilePicURL={user.photoURL}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightView;
