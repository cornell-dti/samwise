import React, { ReactElement } from 'react';
import styles from './Loading.css';

export default (): ReactElement => (
  <div className={styles.LoadingTextWrapper}>
    <div className={styles.LoadingText}>Loading...</div>
  </div>
);
