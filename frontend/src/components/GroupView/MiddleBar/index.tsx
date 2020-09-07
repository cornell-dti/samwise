import React, { ReactElement } from 'react';
import People from './People';
import TaskQueue from './TaskQueue';
import styles from './index.module.scss';

type Props = {
  groupMemberNames: string[];
};

const MiddleBar = ({ groupMemberNames }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <TaskQueue />
    <People groupMemberNames={groupMemberNames} />
  </div>
);

export default MiddleBar;
