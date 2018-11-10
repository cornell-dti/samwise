import React from 'react';
import Clock from 'react-live-clock';
import styles from './TitleBar.css';

function TitleBar() {
  return (
    <header className={styles.Main}>
      <span className={styles.Time}><Clock format="h:mm A" /></span>
      <span className={styles.Date}>
        { new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
      </span>

      <span className={styles.Links}>
        <button type="button" data-sel="sel">Dashboard</button>
        <button type="button">Settings</button>
      </span>
    </header>
  );
}

export default TitleBar;
