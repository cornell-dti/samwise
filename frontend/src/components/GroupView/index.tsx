import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';
import RightView from './RightView';
import styles from './index.module.css';

type Props = {
  groupName: string;
};

const members = ['Darien Lopez', 'Sarah Johnson', 'Michelle Parker', 'Samwise Bear'];

export default ({ groupName }: Props): ReactElement => (
  <div className={styles.GroupView}>
    <MiddleBar groupMemberNames={members} />
    <RightView groupName={groupName} groupMemberNames={members} />
  </div>
);
