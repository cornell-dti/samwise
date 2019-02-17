// @flow strict

import * as React from 'react';
import Settings from '../../../assets/svgs/settings.svg';
import Delete from '../../../assets/svgs/X.svg';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.css';

export default function SettingsButton() {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = () => setShowSettings(true);
  const closeModal = () => setShowSettings(false);

  return (
    <div style={{ display: 'inline-block' }}>
      <button type="submit" onClick={displayModal}>
        <Settings />
      </button>
      {showSettings && (
        <div className={styles.settingsModal}>
          <button className={styles.closeButton} type="submit" onClick={closeModal}>
            <Delete />
          </button>
          <section className={styles.contentWrap}>
            <h2>Settings</h2>
            <SettingsPage />
          </section>
        </div>
      )}
    </div>
  );
}
