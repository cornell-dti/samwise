import React, { ReactElement } from 'react';
// @ts-ignore this module does not have a ts definition file.
import Clock from 'react-live-clock';
import Banner from './Banner';
import { date2FullDateString } from '../../util/datetime-util';
import styles from './index.module.css';
import SettingsButton from './Settings/SettingsButton';

/**
 * The title bar.
 *
 * @type {function(): Node}
 */
export default (): ReactElement => (
  <header className={styles.Main}>
    <Banner />
    <span className={styles.Time}><Clock format="h:mm A" ticking /></span>
    <span className={styles.Date}>{date2FullDateString(new Date())}</span>
    <span className={styles.Links}><SettingsButton /></span>
  </header>
);
