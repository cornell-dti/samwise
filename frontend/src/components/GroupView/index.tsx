import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';
import styles from './index.module.scss';

type Props = {
  groupName: string;
}

// will use groupName later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ groupName }: Props): ReactElement => (
  <div className={styles.GroupView}>
    <MiddleBar />
  </div>
);
