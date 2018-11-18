import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

class CalPicker extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  initialState = () => ({
    pinned: false,
  })

  handleOpenClose = (e) => {
    e.stopPropagation();
    const { onPinChange } = this.props;
    const { pinned } = this.state;
    this.setState({ pinned: !pinned });
    onPinChange(!pinned);
  }
  
  resetState = () => {
    this.setState({ pinned: false });
  }

  render() {
    const { pinned } = this.state;
    return (
      <div className={styles.Main}>
        <span
          onClick={this.handleOpenClose}
          style={{ background: 'none' }}
          className={styles.LabelHack}
        >
          <Icon
            name="pin"
            className={styles.CenterIcon}
            style={{ color: pinned ? 'black' : 'gray' }}
          />
        </span>
      </div>
    );
  }
}

export default CalPicker;
