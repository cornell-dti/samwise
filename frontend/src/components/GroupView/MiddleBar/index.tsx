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
    <div className={styles.MiddleBar}>
      <GroupViewMiddleBarTaskQueue tasks={tasks.filter(({ owner }) => owner.includes(email))} />
      <GroupViewMiddleBarPeopleList
        group={group}
        groupMemberProfiles={groupMemberProfiles}
        changeView={changeView}
      />
    </div>
  );
};

export default GroupViewMiddleBar;
