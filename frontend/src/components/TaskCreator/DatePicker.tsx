import React, { ReactElement, SyntheticEvent, ChangeEvent } from 'react';
import Calendar from 'react-calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
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

  /**
   * Whether or not the repeat subbox is opened.
   */
  const [isRepeat, setIsRepeat] = React.useState<boolean>(false);

  /**
   * Event handler for when the user starts the repeat box
   */
  const startRepeat = (): void => { setIsRepeat(true); };

  /**
   * The component to display when the repeating task box is closed
   */
  const unopenedRepeat = (
    <button type="button" className={styles.RepeatClosed} onClick={startRepeat}>
      <FontAwesomeIcon icon={faPlus} className={styles.PlusIcon} />
      Repeat
    </button>
  );

  const [checkedWeeks, setCheckedWeeks] = React.useState<boolean[]>(
    [false, false, false, false, false, false, false],
  );

  const handleClickWeekday = (e: ChangeEvent): void => {
    const { value, checked } = e.target as HTMLInputElement;
    const val = parseInt(value, 10);
    setCheckedWeeks(checkedWeeks.map((x, i) => (i === val ? checked : x)));
  };

  const weekdayPickers = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].reduce(
    (a, x, i) => (
      <>
        {a}
        <label
          htmlFor={`newTaskRepeatInputCheck${i}`}
          style={checkedWeeks[i] ? {
            background: 'white', color: '#9b9b9b',
          } : {}}
        >
          {x}
          <input
            id={`newTaskRepeatInputCheck${i}`}
            checked={checkedWeeks[i]}
            value={i}
            onChange={handleClickWeekday}
            type="checkbox"
            name="week"
          />
        </label>
      </>
    ), <></>,
  );

  /**
   * The component to display when the repeating task box is open
   */
  const openedRepeat = (
    <div className={styles.RepeatOpened}>
      <FontAwesomeIcon icon={faPlus} className={styles.CloseIcon} />
      <div className={styles.RepeatOpenedInner}>
        <p className={styles.RepeatPickDayWrap}>
          Repeats every week on
          <br />
          {weekdayPickers}
        </p>
        <p className={styles.RepeatPickEndWrap}>
          Stops
          <ul>
            <li>At the end of the semester</li>
            <li>
              After
              {' '}
              <input min="1" max="30" step="1" type="number" />
              {' '}
              occurances
            </li>
          </ul>
        </p>
      </div>
    </div>
  );


  return (
    <div className={styles.Main}>
      {displayedNode(!datePicked)}
      {opened && (
        <div className={styles.NewTaskDatePick}>
          <Calendar onChange={onChange} value={date} minDate={new Date()} calendarType="US" />
          {!isRepeat && unopenedRepeat}
          {isRepeat && openedRepeat}
        </div>
      )}
    </div>
  );
}
