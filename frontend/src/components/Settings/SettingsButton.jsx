// @flow strict

import * as React from 'react';
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
    const showStyles = showSettings ? { display: 'block' } : { display: 'none' };
    return (
      <div style={{ display: 'inline-block' }}>
        <button type="submit" onClick={this.displayModal}>Settings</button>
        <div className={styles.settingsModal}>
          <div style={showStyles}>
            <button className={styles.closeButton} type="submit" onClick={this.closeModal}>
              Close
            </button>
            <TagColorConfigEditor />
          </div>
        </div>
      </div>
    );
  }
}
