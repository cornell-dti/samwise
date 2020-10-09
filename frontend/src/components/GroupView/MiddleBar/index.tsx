import React, { ReactElement } from 'react';
import { Group, SamwiseUserProfile } from 'common/types/store-types';

import GroupViewMiddleBarPeopleList from './GroupViewMiddleBarPeopleList';
import GroupViewMiddleBarTaskQueue from './GroupViewMiddleBarTaskQueue';
import styles from './index.module.scss';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly changeView: (selectedGroup: string | undefined) => void;
};

const GroupViewMiddleBar = ({ groupMemberProfiles, group, changeView }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <GroupViewMiddleBarTaskQueue />
    <GroupViewMiddleBarPeopleList
      group={group}
      groupMemberProfiles={groupMemberProfiles}
      changeView={changeView}
    />
  </div>
);

export default GroupViewMiddleBar;
