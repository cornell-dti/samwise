// @flow strict

import React from 'react';
import Settings from '../../../assets/svgs/settings.svg';
import Delete from '../../../assets/svgs/X.svg';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.css';

export default function SettingsButton() {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = () => setShowSettings(true);
  const closeModal = () => setShowSettings(false);

  // /**
  //  * Display the settings model.
  //  */
  // displayModal = () => this.setState({ showSettings: true });
  //
  // /**
  //  * Close the settings model.
  //  */
  // closeModal = () => this.setState({ showSettings: false });
  return (
    <div style={{ display: 'inline-block' }}>
      <button type="submit" onClick={displayModal}>
        <span style={{ backgroundImage: `url(${Settings})` }} />
      </button>
      {showSettings && (
        <div className={styles.settingsModal}>
          <button className={styles.closeButton} type="submit" onClick={closeModal}>
            <span style={{ backgroundImage: `url(${Delete})` }} />
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
