// @flow strict

import React from 'react';
import { Icon } from 'semantic-ui-react';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.css';

export default function SettingsButton() {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = () => setShowSettings(true);
  const closeModal = () => setShowSettings(false);

  return (
    <div style={{ display: 'inline-block' }}>
      <button type="submit" onClick={displayModal}>
        <Icon name="setting" />
      </button>
      {showSettings && (
        <div className={styles.settingsModal}>
          <button className={styles.closeButton} type="submit" onClick={closeModal}>
            <Icon name="close" />
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
