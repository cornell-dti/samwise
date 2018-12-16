// @flow strict

import React from 'react';
import { Calendar } from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';

type Props = {|
  +onDateChange: (date: Date) => void;
  +onOpened: () => void;
|};
type State = {|
  +date: Date;
  +opened: boolean;
  +reset: boolean;
|};

/**
 * Returns the initial state.
 *
 * @return {State} the initial state.
 */
const initialState = (): State => ({
  date: new Date(),
  opened: false,
  reset: true,
});

export default class CalPicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = initialState();
  }

  resetState = (e: SyntheticEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState(initialState());
  };

  handleOpenClose = (e: SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    const { opened } = this.state;
    this.setState({ opened: !opened });
    if (!opened) {
      const { onOpened } = this.props;
      onOpened();
    }
  };

  handleDateChange = (date: Date) => {
    const { onDateChange } = this.props;
    this.setState({ date, opened: false, reset: false });
    onDateChange(date);
  };

  close = () => this.setState({ opened: false });

  render() {
    const { date, opened, reset } = this.state;
    return (
      <div className={styles.Main}>
        <span
          role="button"
          tabIndex={-1}
          style={{ background: reset ? 'none' : '' }}
          onKeyDown={() => {}}
          onClick={this.handleOpenClose}
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
