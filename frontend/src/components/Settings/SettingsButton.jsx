// @flow
import React, { Component } from 'react';
import Modal from 'react-modal';
import TagColorConfigEditor from '../TagColorConfigEditor/TagColorConfigEditor';

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
    return (
      <div>
        <button type="submit" onClick={this.displayModal}>Settings</button>
        <Modal
          isOpen={destructuredState.showSettings}
          >
          <button type="submit" onClick={this.closeModal}>Close</button>
          <TagColorConfigEditor />
        </Modal>
      </div>

    );
  }
}

export default SettingsButton;
