import React, { ReactElement } from 'react';
import Settings from '../../../assets/svgs/settings.svg';
import Delete from '../../../assets/svgs/XLight.svg';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.css';

export default function SettingsButton(): ReactElement {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = (): void => setShowSettings(true);
  const closeModal = (): void => setShowSettings(false);

  return (
    <div style={{ display: 'inline-block' }}>
      <button type="submit" onClick={displayModal}>
        <Settings className={styles.SettingsButton} />
      </button>
      {showSettings && (
        <div className={styles.SettingsModal}>
          <button className={styles.CloseButton} type="submit" onClick={closeModal}>
            <Delete />
          </button>
          <section className={styles.ContentWrap}>
            <h2>Settings</h2>
            <SettingsPage />
          </section>
        </div>
      )}
    </div>
  );
}
