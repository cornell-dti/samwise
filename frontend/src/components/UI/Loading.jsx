// @flow strict

import React from 'react';
import styles from './Loading.module.css';

export default () => (
  <div className={styles.LoadingTextWrapper}>
    <div className={styles.LoadingText}>Loading...</div>
  </div>
);
