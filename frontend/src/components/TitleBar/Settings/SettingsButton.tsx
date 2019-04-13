import React, { ReactElement } from 'react';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.module.css';
import SamwiseIcon from '../../UI/SamwiseIcon';
import Tooltip from '../../UI/Tooltip';

export default function SettingsButton(): ReactElement {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = (): void => setShowSettings(true);
  const closeModal = (): void => setShowSettings(false);

  return (
    <div style={{ display: 'inline-block' }}>
      <button type="submit" onClick={displayModal}>
        <Tooltip text="Settings Button" iconName="settings" />
      </button>
      {showSettings && (
        <div className={styles.SettingsModal}>
          <button className={styles.CloseButton} type="submit" onClick={closeModal}>
            <SamwiseIcon iconName="x-light" />
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
