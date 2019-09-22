import React, { ReactElement, SyntheticEvent, ChangeEvent } from 'react';
import Calendar from 'react-calendar';
import styles from './Picker.module.css';
import dateStyles from './DatePicker.module.css';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG } from '../../util/tag-util';
import { RepeatMetaData } from '../../store/store-types';
import SamwiseIcon from '../UI/SamwiseIcon';
import { LAST_DAY_OF_CLASS, LAST_DAY_OF_EXAMS } from '../../util/const-util';
import { setDayOfWeek, unsetDayOfWeek, isDayOfWeekSet, DAYS_IN_WEEK } from '../../util/bitwise-util';

type Props = {
  readonly onDateChange: (date: Date | RepeatMetaData | null) => void;
  readonly date: Date | RepeatMetaData;
  readonly opened: boolean;
  readonly datePicked: boolean;
  readonly onPickerOpened: () => void;
  readonly onClearPicker: () => void;
};

type InternalDate =
{
  type: 'normal';
  date: Date;
} | {
  type: 'repeat';
  checkedWeeks: number;
  endOption: 0 | 1;
  calOpened: boolean;
  repeatEnd: Date | number;
};

const REPEATING_TASK_ENABLED: boolean = localStorage.getItem('REPEATING_TASK_ENABLED') != null;

export default function DatePicker(props: Props): ReactElement {
  const {
    date, opened, datePicked, onDateChange, onPickerOpened, onClearPicker,
  } = props;
  // Controllers
  const clickPicker = (): void => { onPickerOpened(); };
  const reset = (e: SyntheticEvent<HTMLElement>): void => {
    e.stopPropagation();
    onClearPicker();
  };

  const [internalDate, setInternalDate] = React.useState<InternalDate>(
    date instanceof Date ? { type: 'normal', date } : {
      type: 'repeat',
      checkedWeeks: date.pattern.bitSet,
      endOption: 1,
      calOpened: false,
      repeatEnd: date.endDate,
    },
  );

  /**
   * Generates the date string of the next valid day in a bitset pattern
   */
  const genNextValidDay = (bitset: number): string => {
    const currDay = new Date().getDay();
    for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
      const checkDay = (i + currDay) % DAYS_IN_WEEK;
      if (isDayOfWeekSet(bitset, checkDay)) {
        return date2String(new Date(+(new Date()) + 1000 * 60 * 60 * 24 * i));
      }
    }
    return '';
  };

  // Nodes
  const displayedNode = (isDefault: boolean): ReactElement => {
    const style = isDefault ? {} : { background: NONE_TAG.color };
    const internal = isDefault
      ? <SamwiseIcon iconName="calendar-dark" className={styles.CenterIcon} />
      : (
        <>
          <span className={styles.DateDisplay}>
            {date instanceof Date ? date2String(date) : `${genNextValidDay(date.pattern.bitSet)}🔁`}
          </span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </>
      );
    return (
      <span role="presentation" onClick={clickPicker} className={styles.Label} style={style}>
        {internal}
      </span>
    );
  };

  /**
   * Event handler for when the user starts the repeat box
   */
  const changeRepeat = (e: ChangeEvent): void => {
    if ((e.target as HTMLSelectElement).value === 'true') {
      setInternalDate({ type: 'repeat', checkedWeeks: 0, endOption: 0, calOpened: false, repeatEnd: 0 });
    } else {
      setInternalDate({ type: 'normal', date: new Date() });
    }
  };

  /**
   * The state to keep track of which days the user would like to repeat
   */
  const [checkedWeeks, setCheckedWeeks] = React.useState<number>(
    date instanceof Date ? 0 : date.pattern.bitSet,
  );

  /**
   * Event handler when checking or unchecking a weekday for repeating
   */
  const handleClickWeekday = (e: ChangeEvent): void => {
    const { value, checked } = e.target as HTMLInputElement;
    const val = parseInt(value, 10);
    if (checked) {
      setCheckedWeeks(setDayOfWeek(checkedWeeks, val));
    } else {
      setCheckedWeeks(unsetDayOfWeek(checkedWeeks, val));
    }
  };

  /**
   * The list of labels and inputs making up the seven weekdays users can check and uncheck
   */
  const weekdayPickers = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
    (x, i) => (
      <>
        <label
          htmlFor={`newTaskRepeatInputCheck${i}`}
          style={isDayOfWeekSet(checkedWeeks, i) ? {
            background: '#5a5a5a', color: 'white',
          } : {}}
        >
          {x}
          <input
            id={`newTaskRepeatInputCheck${i}`}
            checked={isDayOfWeekSet(checkedWeeks, i)}
            value={i}
            onChange={handleClickWeekday}
            type="checkbox"
            name="repeatWeek"
          />
        </label>
      </>
    ),
  );

  /**
   * The state to keep track of which repeat end option the user has chosen.
   */
  const [endOption, setEndOption] = React.useState<0|1>(date instanceof Date ? 0 : 1);

  /**
   * Event handler for choosing a repeat end option
   * @param e The onchange event
   */
  const handleClickEnd = (e: ChangeEvent): void => {
    const { value } = e.target as HTMLInputElement;
    const valNum = parseInt(value, 10);
    if (valNum !== 0 && valNum !== 1) { return; }
    setEndOption(valNum);
  };

  /**
   * Whether or not the pick repeat end date calendar is open
   */
  const [calOpened, setCalOpened] = React.useState<boolean>(false);

  /**
   * Event handler for when the user starts the repeat box
   */
  const handleClickRepeatCal = (): void => { setCalOpened(!calOpened); };

  /**
   * When to end the repeating task if the user chooses to end on a date.
   */
  const [repeatEndDate, setRepeatEndDate] = React.useState<Date>(
    (() => {
      if (date instanceof Date) {
        return new Date();
      }
      return (date.endDate instanceof Date ? date.endDate : new Date());
    })(),
  );
  /**
   * Event handler for choosing a date to end the repeat
   * @param d The date chosen from the Calendar component
   */
  const handleSetRepeatEndDate = (d: Date | Date[]): void => {
    setCalOpened(false);
    setRepeatEndDate(d instanceof Array ? d[0] : d);
    setEndOption(0);
  };


  /**
   * When to end the repeating task if the user chooses to end after a
   * certain number of times.
   */
  const [repeatNumber, setRepeatNumber] = React.useState<number>(0);
  /**
   * Event handler for choosing a repeat end option
   * @param e The onchange event
   */
  const handleSetRepeatNumber = (e: ChangeEvent): void => {
    const { value } = e.target as HTMLInputElement;
    setRepeatNumber(parseInt(value, 10));
    setEndOption(1);
  };

  /**
   * Set the end of the date to a specified date
   * @param d The date to set the repeat end date
   */
  const testSetEndSem = (d: Date): void => {
    setRepeatEndDate(d);
    setCalOpened(false);
  };


  /**
   * The list of li elements for all the repeat end options
   */
  const endPicker = [
    <>
      On
      {' '}
      <button
        type="button"
        className={dateStyles.SubtleBtn}
        onClick={handleClickRepeatCal}
      >
        {repeatEndDate.toLocaleDateString()}
      </button>
      {
        calOpened
        && (
          <div>
            <Calendar
              value={repeatEndDate}
              minDate={new Date()}
              onChange={handleSetRepeatEndDate}
              calendarType="US"
            />
            <p>
              <button type="button" onClick={() => testSetEndSem(LAST_DAY_OF_CLASS)}>
                Last Day of Class (
                {LAST_DAY_OF_CLASS.toLocaleDateString()}
                )
              </button>
              <button type="button" onClick={() => testSetEndSem(LAST_DAY_OF_EXAMS)}>
                Last Day of Finals (
                {LAST_DAY_OF_EXAMS.toLocaleDateString()}
                )
              </button>
            </p>
          </div>
        )
      }
    </>,
    <>
      After
      {' '}
      <input value={repeatNumber} onChange={handleSetRepeatNumber} min="1" max="30" step="1" type="number" />
      {' '}
      weeks
    </>,
  ].map((x, i) => (
    <>
      <li>
        <label htmlFor={`newTaskRepeatEndRadio${i}`}>
          <input
            type="radio"
            name="repeatEnd"
            id={`newTaskRepeatEndRadio${i}`}
            value={i}
            checked={i === endOption}
            onChange={handleClickEnd}
          />
          {x}
        </label>
      </li>
    </>
  ));

  /**
   * The component to display when the repeating task box is open
   */
  const openedRepeat = (
    <div className={styles.RepeatOpened}>
      <p className={styles.RepeatPickDayWrap}>
          Repeats every week on
        <br />
        {weekdayPickers}
      </p>
      <div className={styles.RepeatPickEndWrap}>
          Stops
        <ul className={dateStyles.EndPicker}>{endPicker}</ul>
      </div>
    </div>
  );

  /**
   * State keeping track of the selected date
   */
  const [currDate, setCurrDate] = React.useState<Date>(date instanceof Date ? date : new Date());

  /**
   * Resets all the react states regarding repeating tasks
   */
  const resetRepeats = (): void => {
    setCheckedWeeks(0);
    setCalOpened(false);
    setRepeatNumber(0);
    setRepeatEndDate(new Date());
    setEndOption(0);
  };

  /**
   * Event handler for when the user changes the calendar date
   */
  const onChange = (d: Date | Date[]): void => {
    if (Array.isArray(d)) {
      return;
    }
    setCurrDate(d);
  };

  /**
   * Event handler for when the user tries to save
   */
  const onSubmit = (): void => {
    if (internalDate.type === 'repeat') {
      const bitSet = checkedWeeks;

      // If they didn't pick any days to repeat on, don't save.
      if (bitSet === 0) { return; }

      let endDate;

      switch (endOption) {
        case 0:
          endDate = repeatEndDate;
          break;
        case 1:
          endDate = new Date(+(new Date()) + 1000 * 60 * 60 * 24 * 7 * repeatNumber);
          // checkedWeeks.reduce((acc, x) => acc + (x ? 1 : 0), 0));
          break;
        default:
          // Illegal state
          return;
      }

      const repData: RepeatMetaData = {
        startDate: new Date(),
        endDate,
        pattern: { type: 'WEEKLY', bitSet },
      };
      onDateChange(repData);
    } else {
      onDateChange(currDate);
    }
  };

  /**
   * Event handler for when the user tries to cancel
   */
  const onCancel = (): void => {
    resetRepeats();
    onDateChange(null);
  };

  return (
    <div className={styles.Main}>
      {displayedNode(!datePicked)}
      {opened && (
        <div className={styles.NewTaskDatePick}>
          {REPEATING_TASK_ENABLED && (
            <p className={dateStyles.SelectTypeWrap}>
              <select
                className={dateStyles.SelectType}
                value={(internalDate.type !== 'normal').toString()}
                onChange={changeRepeat}
              >
                <option value="false">One-Time</option>
                <option value="true">Repeating</option>
              </select>
            </p>
          )}
          {internalDate.type === 'normal' && <Calendar onChange={onChange} value={currDate} minDate={new Date()} calendarType="US" />}
          {internalDate.type !== 'normal' && openedRepeat}
          <p className={styles.NewTaskDateSave}>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="button" onClick={onSubmit}>Done</button>
          </p>
        </div>
      )}
    </div>
  );
}
