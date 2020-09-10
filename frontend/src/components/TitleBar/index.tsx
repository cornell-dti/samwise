import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { useTime } from 'hooks/time-hook';
import { date2FullDateString } from 'common/util/datetime-util';
import { State, Theme } from 'common/types/store-types';
import Banner from './Banner';
import GroupInvites from './GroupInvites';
import styles from './index.module.scss';
import SettingsButton from './Settings/SettingsButton';

/**
 * The title bar.
 *
 * @type {function(): Node}
 */
export function TitleBar(props: { theme: Theme }): ReactElement {
  const time = useTime();
  const date = new Date(time);
  const dateString = date2FullDateString(date);
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });
  const { theme } = props;
  const darkModeStyles =
    theme === 'dark'
      ? {
          background: 'black',
          color: 'white',
        }
      : undefined;
  return (
    <header className={styles.Main} style={darkModeStyles}>
      <Banner />
      <GroupInvites />
      <span title="time" className={styles.Time}>
        {timeString}
      </span>
      <span title="date" className={styles.Date}>
        {dateString}
      </span>
      <span className={styles.Links}>
        <SettingsButton />
      </span>
    </header>
  );
}

const Connected = connect(({ settings: { theme } }: State): { theme: Theme } => ({ theme }))(
  TitleBar
);
export default Connected;
