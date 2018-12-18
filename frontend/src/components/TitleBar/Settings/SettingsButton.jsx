// @flow strict

import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import TagColorConfigEditor from '../ColorConfigEditor/ColorConfigEditor';
import styles from './SettingsButtonStyles.css';

type State = {|
  +showSettings: boolean;
|};

export default class SettingsButton extends React.Component<{}, State> {
  constructor() {
    super();
    this.state = { showSettings: false };
  }

  displayModal = () => {
    this.setState({ showSettings: true });
  };

  closeModal = () => {
    this.setState({ showSettings: false });
  };

  render() {
    const { showSettings } = this.state;
    return (
      <div style={{ display: 'inline-block' }}>
        <button type="submit" onClick={this.displayModal}>
          <Icon name="setting" />
        </button>
        {
          showSettings && (
            <div className={styles.settingsModal}>
              <span className={styles.changesSaved}>All changes saved</span>
              <button className={styles.closeButton} type="submit" onClick={this.closeModal}>
                <Icon name="close" />
              </button>
              <section className={styles.contentWrap}>
                <h2>Settings</h2>
                <TagColorConfigEditor />
              </section>
            </div>
          )
        }
      </div>
    );
  }
}
