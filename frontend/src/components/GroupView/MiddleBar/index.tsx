import React, { ReactElement } from 'react';
import GroupViewMiddleBarPeopleList from './GroupViewMiddleBarPeopleList';
import GroupViewMiddleBarTaskQueue from './GroupViewMiddleBarTaskQueue';
import styles from './index.module.scss';

type Props = {
  groupMemberNames: string[];
};

const GroupViewMiddleBar = ({ groupMemberNames }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <GroupViewMiddleBarTaskQueue />
    <GroupViewMiddleBarPeopleList groupMemberNames={groupMemberNames} />
  </div>
);

export default GroupViewMiddleBar;
