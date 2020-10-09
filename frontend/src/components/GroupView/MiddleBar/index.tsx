import React, { ReactElement } from 'react';
import { SamwiseUserProfile } from 'common/types/store-types';

import GroupViewMiddleBarPeopleList from './GroupViewMiddleBarPeopleList';
import GroupViewMiddleBarTaskQueue from './GroupViewMiddleBarTaskQueue';
import styles from './index.module.scss';

type Props = { readonly groupMemberProfiles: readonly SamwiseUserProfile[] };

const GroupViewMiddleBar = ({ groupMemberProfiles }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <GroupViewMiddleBarTaskQueue />
    <GroupViewMiddleBarPeopleList groupMemberProfiles={groupMemberProfiles} />
  </div>
);

export default GroupViewMiddleBar;
