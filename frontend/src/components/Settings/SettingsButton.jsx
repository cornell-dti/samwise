// @flow
import React, { Component } from 'react';
import TagColorConfigEditor from '../TagColorConfigEditor/TagColorConfigEditor';

class SettingsButton extends Component {
  constructor() {
    super();
    this.state = {
      showSettings: true,
    };
  }

  state: {
    showSettings: Boolean,
  };

  displayModal = () => {
    this.setState(prevState => ({ showSettings: !prevState.showSettings }));
  }

  render() {
    const destructuredState = this.state;
    console.log(destructuredState.showSettings);
    return (
      <div>
        <button type="submit" onClick={this.displayModal}>Settings</button>
        {destructuredState.showSettings ? <TagColorConfigEditor /> : null}
      </div>

    );
  }
}

export default SettingsButton;
