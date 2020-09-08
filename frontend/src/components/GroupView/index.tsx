import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';
import RightView from './RightView';
import styles from './index.module.scss';

type Props = {
  groupName: string;
};

const members = ['Darien Lopez', 'Sarah Johnson', 'Michelle Parker', 'Samwise Bear'];

const GroupView = ({ groupName }: Props): ReactElement => (
  <div className={styles.GroupView}>
    <MiddleBar groupMemberNames={members} />
    <RightView groupName={groupName} groupMemberNames={members} />
  </div>
);

export default GroupView;
