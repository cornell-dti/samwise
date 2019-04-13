import React, { ReactElement, SyntheticEvent } from 'react';
import Calendar from 'react-calendar';
import styles from './Picker.module.css';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG } from '../../util/tag-util';
import SamwiseIcon from '../UI/SamwiseIcon';

type Props = {
  readonly onDateChange: (date: Date | null) => void;
  readonly date: Date;
  readonly opened: boolean;
  readonly datePicked: boolean;
  readonly onPickerOpened: () => void;
};

export default function DatePicker(props: Props): ReactElement {
  const {
    date, opened, datePicked, onDateChange, onPickerOpened,
  } = props;
  // Controllers
  const clickPicker = (): void => { onPickerOpened(); };
  const reset = (e: SyntheticEvent<HTMLElement>): void => {
    e.stopPropagation();
    onDateChange(null);
  };
  // Nodes
  const displayedNode = (isDefault: boolean): ReactElement => {
    const style = isDefault ? {} : { background: NONE_TAG.color };
    const internal = isDefault
      ? <SamwiseIcon iconName="calendar-dark" className={styles.CenterIcon} />
      : (
        <>
          <span className={styles.DateDisplay}>{date2String(date)}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </>
      );
    return (
      <span role="presentation" onClick={clickPicker} className={styles.Label} style={style}>
        {internal}
      </span>
    );
  };
  const onChange = (d: Date | Date[]): void => {
    if (Array.isArray(d)) {
      return;
    }
    onDateChange(d);
  };
  return (
    <div className={styles.Main}>
      {displayedNode(!datePicked)}
      {opened && (
        <div className={styles.NewTaskDatePick}>
          <Calendar onChange={onChange} value={date} minDate={new Date()} calendarType="US" />
        </div>
      )}
    </div>
  );
}
