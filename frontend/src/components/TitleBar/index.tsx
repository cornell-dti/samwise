import React, { ReactElement } from 'react';
import { useTime } from 'hooks/time-hook';
import { date2FullDateString } from 'common/lib/util/datetime-util';
import Banner from './Banner';
import styles from './index.module.css';
import SettingsButton from './Settings/SettingsButton';

/**
 * The title bar.
 *
 * @type {function(): Node}
 */
export default (): ReactElement => {
  const time = useTime();
  const date = new Date(time);
  const dateString = date2FullDateString(date);
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });
  return (
    <header className={styles.Main}>
      <Banner />
      <span title="time" className={styles.Time}>{timeString}</span>
      <span title="date" className={styles.Date}>{dateString}</span>
      <span className={styles.Links}><SettingsButton /></span>
    </header>
  );
};
