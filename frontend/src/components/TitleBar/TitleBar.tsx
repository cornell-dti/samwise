import React, { ReactElement } from 'react';
// @ts-ignore this module does not have a ts definition file.
import Clock from 'react-live-clock';
import { date2FullDateString } from '../../util/datetime-util';
import styles from './TitleBar.css';
import SettingsButton from './Settings/SettingsButton';

/**
 * The title bar.
 *
 * @type {function(): Node}
 */
export default (): ReactElement => (
  <header className={styles.Main}>
    <span className={styles.Time}><Clock format="h:mm A" ticking /></span>
    <span className={styles.Date}>{date2FullDateString(new Date())}</span>
    <span className={styles.Links}><SettingsButton /></span>
  </header>
);
