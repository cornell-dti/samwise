import React, { ReactElement } from 'react';
import { Group, SamwiseUserProfile } from 'common/types/store-types';

import GroupViewMiddleBarPeopleList from './GroupViewMiddleBarPeopleList';
import GroupViewMiddleBarTaskQueue from './GroupViewMiddleBarTaskQueue';
import styles from './index.module.scss';

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
};

const GroupViewMiddleBar = ({ groupMemberProfiles, group }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <GroupViewMiddleBarTaskQueue />
    <GroupViewMiddleBarPeopleList group={group} groupMemberProfiles={groupMemberProfiles} />
  </div>
);

export default GroupViewMiddleBar;
