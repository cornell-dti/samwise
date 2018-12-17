// @flow strict

import React from 'react';
import { Calendar } from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';
import { date2String } from '../../util/datetime-util';

type Props = {|
  +onDateChange: (date: Date) => void;
  +opened: boolean;
  +onPickerOpened: () => void;
|};
type State = {|
  +date: Date;
  +reset: boolean;
|};

/**
 * Returns the initial state.
 *
 * @return {State} the initial state.
 */
const initialState = (): State => ({
  date: new Date(),
  reset: true,
});

export default class CalPicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = initialState();
  }

  reset = () => this.setState(initialState());

  clickPicker = (e: SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    const { opened, onPickerOpened } = this.props;
    if (!opened) {
      onPickerOpened();
    }
  };

  handleDateChange = (date: Date) => {
    const { onDateChange } = this.props;
    this.setState({ date, reset: false });
    onDateChange(date);
  };

  render() {
    const { opened } = this.props;
    const { date, reset } = this.state;
    const displayedNode = (isDefault: boolean) => {
      const style = { background: reset ? 'none' : '' };
      const internal = isDefault
        ? (<Icon name="calendar outline" className={styles.CenterIcon} />)
        : (
          <React.Fragment>
            <span className={styles.DateDisplay}>{date2String(date)}</span>
            <button type="button" className={styles.ResetButton} onClick={this.reset}>
              &times;
            </button>
          </React.Fragment>
        );
      return (
        <span role="presentation" onClick={this.clickPicker} className={styles.Label} style={style}>
          {internal}
        </span>
      );
    };
    return (
      <div className={styles.Main}>
        {displayedNode(reset)}
        {opened && (
          <div className={styles.NewTaskDatePick}>
            <Calendar
              onChange={this.handleDateChange}
              value={date}
              minDate={new Date()}
            />
          </div>
        )}
      </div>
    );
  }
}
