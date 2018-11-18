import React, { Component } from 'react';
import { Calendar } from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

class CalPicker extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  initialState = () => ({
    date: new Date(),
    opened: false,
    reset: true,
  })

  resetState = (e) => {
    e.stopPropagation();
    this.setState(this.initialState());
  }

  handleOpenClose = (e) => {
    e.stopPropagation();
    const { opened } = this.state;
    this.setState({ opened: !opened });
  }

  handleDateChange = (e) => {
    const { onDateChange } = this.props;
    this.setState({ date: e, opened: false, reset: false });
    onDateChange(e);
  }

  render() {
    const { date, opened, reset } = this.state;
    return (
      <div className={styles.Main}>
        <span
          ref={this.changeClass}
          onClick={this.handleOpenClose}
          style={{ background: reset ? 'none' : '' }}
          className={styles.LabelHack}
        >
          <span className={styles.DateDisplay} style={{ display: reset ? 'none' : 'inline' }}>
            {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
          </span>
          <Icon
            name="calendar outline"
            className={styles.CenterIcon}
            style={{ display: reset ? 'inline' : 'none', color: 'black' }}
          />
          <button
            type="button"
            className={styles.ResetButton}
            onClick={this.resetState}
            style={{ display: reset ? 'none' : 'inline' }}
          >
            &times;
          </button>
        </span>
        <div className={styles.NewTaskDatePick} style={{ display: opened ? 'block' : 'none' }}>
          <Calendar
            onChange={this.handleDateChange}
            value={date}
            minDate={new Date()}
          />
        </div>
      </div>
    );
  }
}

export default CalPicker;
