import React, { ReactElement } from 'react';
import type { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import GroupTaskRow from './GroupTaskRow';
import styles from './index.module.scss';
import TaskCreator from '../../TaskCreator';
import { promptTextInput } from '../../Util/Modals';
import { updateGroup } from '../../../firebase/actions';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles:  SamwiseUserProfile[];
  readonly tasks: readonly Task[];
};

const RightView = ({ group, groupMemberProfiles, tasks }: Props): ReactElement => {
  const onEditGroupNameClicked = (): void => {
    promptTextInput('Edit your group name', '', 'New Group Name', 'Submit', 'text').then((name) =>
      updateGroup({ ...group, name })
    );
  };

  return (
    <div className={styles.RightView}>
      <div className={styles.GroupTaskCreator}>
        <TaskCreator view="group" group={group.name} />
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
          {groupMemberProfiles.map(({ name, photoURL, email }) => {
            const filteredTasks = tasks.filter((t) => t.owner === email);
            return (
              <GroupTaskRow
                tasks={filteredTasks}
                memberName={name}
                profilePicURL={photoURL}
                key={email}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightView;
