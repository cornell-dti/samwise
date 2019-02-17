// @flow strict

import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { Settings } from '../../assets/svgs/settings.svg'
import { Delete } from '../../assets/svgs/X.svg'
import SettingsPage from './SettingsPage';
import styles from './SettingsButton.css';

type State = {|
  +showSettings: boolean;
|};

export default class SettingsButton extends React.PureComponent<{||}, State> {
  state: State = { showSettings: false };

  /**
   * Display the settings model.
   */
  displayModal = () => this.setState({ showSettings: true });

  /**
   * Close the settings model.
   */
  closeModal = () => this.setState({ showSettings: false });

  render() {
    const { showSettings } = this.state;
    return (
      <div style={{ display: 'inline-block' }}>
        <button type="submit" onClick={this.displayModal}>
          <Settings /> // use Settings
        </button>
        {showSettings && (
          <div className={styles.settingsModal}>
            { /*<span className={styles.changesSaved}>All changes saved</span>*/ }
            <button className={styles.closeButton} type="submit" onClick={this.closeModal}>
              <Delete /> // use Delete
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
}
