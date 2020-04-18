import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';
import RightView from './RightView';
import styles from './index.module.scss';

type Props = {
  groupName: string;
}

const members = ['Darien Lopez', 'Sarah Johnson', 'Michelle Parker'];

// will use groupName later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ groupName }: Props): ReactElement => (
  <div className={styles.GroupView}>
    <MiddleBar />
    <RightView
      groupName={groupName}
      groupMemberNames={members}
    />
  </div>
);
