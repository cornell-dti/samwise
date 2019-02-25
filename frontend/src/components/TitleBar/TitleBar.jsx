// @flow strict

import React from 'react';
import type { Node } from 'react';
import Clock from 'react-live-clock';
import { date2FullDateString } from '../../util/datetime-util';
import styles from './TitleBar.module.css';
import SettingsButton from './Settings/SettingsButton';

/**
 * The title bar.
 *
 * @type {function(): Node}
 */
export default (): Node => (
  <header className={styles.Main}>
    <span className={styles.Time}><Clock format="h:mm A" ticking /></span>
    <span className={styles.Date}>{date2FullDateString(new Date())}</span>
    <span className={styles.Links}><SettingsButton /></span>
  </header>
);
