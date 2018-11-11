// @flow
import React, { Component } from 'react';
import TagColorConfigEditor from '../TagColorConfigEditor/TagColorConfigEditor';
import styles from './SettingsButtonStyles.css';

class SettingsButton extends Component {
  constructor() {
    super();
    this.state = {
      showSettings: false,
    };
  }

  state: {
    showSettings: Boolean,
  };

  displayModal = () => {
    this.setState({ showSettings: true });
  }

  closeModal = () => {
    this.setState({showSettings: false})
  }

  render() {
    const destructuredState = this.state;
    const showStyles = destructuredState.showSettings ? {display: 'block'} : {display: 'none'};
    return (
      <div style={{ display: 'inline-block' }}>
        <button type="submit" onClick={this.displayModal}>Settings</button>
        <div className={styles.settingsModal}>
          <div
            style={showStyles}
            >
            <button className={styles.closeButton} type="submit" onClick={this.closeModal}>Close</button>
            <TagColorConfigEditor />
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsButton;
