import React, { ReactElement } from 'react';
import People from './People';
import TaskQueue from './TaskQueue';
import styles from './index.module.scss';

export default (): ReactElement => (
  <div className={styles.MiddleBar}>
    <TaskQueue />
    <People groupMemberNames={['Darien Lopez', 'Sarah Johnson', 'Michelle Parker']} />
  </div>
);
