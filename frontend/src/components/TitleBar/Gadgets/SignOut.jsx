// @flow strict

import React from 'react';

import styles from '../Settings/SettingsPage.module.css';
import { firebaseSignOut } from '../../../firebase/auth';

/**
 * The sign out component.
 */
export default () => (
  <div className={styles.SettingsSection}>
    <div className={styles.SettingsButton}>
      <button type="button" className={styles.SignButton} onClick={firebaseSignOut}>
        Sign Out
      </button>
    </div>
  </div>
);
