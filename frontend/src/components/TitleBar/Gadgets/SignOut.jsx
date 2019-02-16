// @flow strict

import React from 'react';

import styles from '../Settings/SettingsPage.css';
import { firebaseSignOut } from '../../../util/firebase-util';

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
