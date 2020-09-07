import React, { ReactElement } from 'react';
import styles from './Loading.module.scss';

const Loading = (): ReactElement => (
  <div className={styles.LoadingTextWrapper}>
    <div className={styles.LoadingText}>Loading...</div>
  </div>
);

export default Loading;
