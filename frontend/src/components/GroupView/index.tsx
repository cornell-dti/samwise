import React, { ReactElement } from 'react';
import MiddleBar from './MiddleBar';
import styles from './index.module.scss';

type Props = {
  groupName: string;
}

export default ({ groupName }: Props): ReactElement => (
  <div className={styles.MiddleBar}>
    <MiddleBar />
  </div>
);
