import React, { ReactElement } from 'react';
import styles from './Loading.module.css';

const Loading = (): ReactElement => (
  <div className={styles.LoadingTextWrapper}>
    <div className={styles.LoadingText}>Loading...</div>
  </div>
);

export default Loading;
