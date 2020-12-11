import React, { ReactElement, useState } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';
import GroupTaskProgress from './GroupTaskProgress';
import { promptTextInput } from '../../Util/Modals';
import { updateGroup } from '../../../firebase/actions';

type State = {
  readonly taskCreatorOpened: boolean;
  readonly assignedMembers?: readonly SamwiseUserProfile[];
};

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly tasks: readonly Task[];
};

const RightView = ({ group, groupMemberProfiles, tasks }: Props): ReactElement => {
  const [{ taskCreatorOpened, assignedMembers }, setState] = useState<State>({
    taskCreatorOpened: false,
    assignedMembers: undefined,
  });

  const onEditGroupNameClicked = (): void => {
    promptTextInput('Edit your group name', '', 'New Group Name', 'Submit', 'text').then((name) =>
      updateGroup({ ...group, name })
    );
  };

  const openTaskCreator = (member: readonly SamwiseUserProfile[]): void =>
    setState({
      taskCreatorOpened: true,
      assignedMembers: member,
    });

  const closeTaskCreator = (): void =>
    setState({
      taskCreatorOpened: false,
    });

  const clearAssignedMembers = (): void =>
    setState({ taskCreatorOpened, assignedMembers: undefined });

  return (
    <div className={styles.RightView}>
      <div className={styles.GroupTaskCreator}>
        <TaskCreator
          view="group"
          group={group.id}
          groupMemberProfiles={groupMemberProfiles}
          taskCreatorOpened={taskCreatorOpened}
          closeTaskCreator={closeTaskCreator}
          assignedMembers={assignedMembers}
          clearAssignedMembers={clearAssignedMembers}
        />
      </div>

      <div className={styles.RightViewMain}>
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
            const filteredTasks = tasks.filter(({ owner }) => owner.includes(user.email));
            return (
              <GroupTaskRow
                key={user.email}
                memberName={user.name}
                userProfile={user}
                onClick={openTaskCreator}
                tasks={filteredTasks}
                profilePicURL={user.photoURL}
                groupID={group.id}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.GroupTaskProgress}>
        <GroupTaskProgress tasks={tasks} deadline={group.deadline} />
      </div>
    </div>
  );
};

export default RightView;
