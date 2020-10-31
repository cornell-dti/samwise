import React, { ReactElement } from 'react';
import { Group, SamwiseUserProfile, Task } from 'common/types/store-types';
import { getAppUser } from '../../../firebase/auth-util';

import GroupViewMiddleBarPeopleList from './GroupViewMiddleBarPeopleList';
import GroupViewMiddleBarTaskQueue from './GroupViewMiddleBarTaskQueue';
import styles from './index.module.scss';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly changeView: (selectedGroup: string | undefined) => void;
  readonly tasks: readonly Task[];
};

const GroupViewMiddleBar = ({
  groupMemberProfiles,
  group,
  changeView,
  tasks,
}: Props): ReactElement => {
  const { email } = getAppUser();

  return (
    <div>
      {groupMemberProfiles.map(() => {
        const filteredTasks = tasks.filter(({ owner }) => owner.includes(email));
        return (
          <div className={styles.MiddleBar}>
            <GroupViewMiddleBarTaskQueue tasks={filteredTasks} />
            <GroupViewMiddleBarPeopleList
              group={group}
              groupMemberProfiles={groupMemberProfiles}
              changeView={changeView}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GroupViewMiddleBar;
