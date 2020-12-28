import React, { ReactElement } from 'react';
import clsx from 'clsx';
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.module.scss';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = { readonly buttonClassname?: string };

export default function SettingsButton({ buttonClassname }: Props): ReactElement {
  const [showSettings, setShowSettings] = React.useState(false);

  const displayModal = (): void => setShowSettings(true);
  const closeModal = (): void => setShowSettings(false);

  return (
    <div className={styles.SettingsButtonContainer}>
      <button
        type="submit"
        onClick={displayModal}
        className={clsx(buttonClassname, styles.SettingsButton)}
      >
        <p style={{ transform: 'scale(2)translateY(-5px)' }} title="Settings Button">
          <SamwiseIcon iconName="settings" />
        </p>
      </button>
      {showSettings && (
        <div className={styles.SettingsModal}>
          <button
            className={styles.CloseButton}
            type="submit"
            title="Close Settings"
            onClick={closeModal}
            tabIndex={-1}
          >
            <SamwiseIcon iconName="x-light-settings" />
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
