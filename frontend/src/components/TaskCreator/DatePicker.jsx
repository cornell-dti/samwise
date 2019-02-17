// @flow strict

import React from 'react';
import { Calendar } from 'react-calendar';
import { Icon } from 'semantic-ui-react';
import styles from './Picker.css';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG } from '../../util/tag-util';

type Props = {|
  +onDateChange: (date: Date) => void;
  +date: Date;
  +opened: boolean;
  +datePicked: boolean;
  +onPickerOpened: () => void;
|};

export default function DatePicker(props: Props) {
  const {
    date, opened, datePicked, onDateChange, onPickerOpened,
  } = props;
  // Controllers
  const clickPicker = () => { onPickerOpened(); };
  const reset = (e) => { e.stopPropagation(); onDateChange(null); };
  // Nodes
  const displayedNode = (isDefault: boolean) => {
    const style = isDefault ? {} : { background: NONE_TAG.color };
    const internal = isDefault
      ? (<Icon name="calendar outline" className={styles.CenterIcon} />)
      : (
        <React.Fragment>
          <span className={styles.DateDisplay}>{date2String(date)}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </React.Fragment>
      );
    return (
      <span role="presentation" onClick={clickPicker} className={styles.Label} style={style}>
        {internal}
      </span>
    );
  };
  return (
    <div className={styles.Main}>
      {displayedNode(!datePicked)}
      {opened && (
        <div className={styles.NewTaskDatePick}>
          <Calendar
            onChange={onDateChange}
            value={date}
            minDate={new Date()}
          />
        </div>
      )}
    </div>
  );
}
