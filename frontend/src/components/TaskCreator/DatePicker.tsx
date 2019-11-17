import React, { ReactElement, SyntheticEvent, ChangeEvent } from 'react';
import Calendar from 'react-calendar';
import { useTodayLastSecondTime, useTodayFirstSecondTime } from 'hooks/time-hook';
import styles from './Picker.module.css';
import dateStyles from './DatePicker.module.css';
import { date2String, getDateAfterXWeeks } from '../../util/datetime-util';
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
  type: 'normal' | 'repeat';
  date: Date;
  checkedWeeks: number;
  calOpened: boolean;
  repeatEnd: {
    type: 'date' | 'weeks';
    date: Date;
    weeks: number;
  };
};

export default function DatePicker(props: Props): ReactElement {
  const {
    date, opened, datePicked, onDateChange, onPickerOpened, onClearPicker,
  } = props;
  const todayFirstSecond = useTodayFirstSecondTime();
  const todayLastSecond = useTodayLastSecondTime();

  // Controllers
  const clickPicker = (): void => { onPickerOpened(); };
  const reset = (e: SyntheticEvent<HTMLElement>): void => {
    e.stopPropagation();
    onClearPicker();
  };

  const [internalDate, setInternalDate] = React.useState<InternalDate>(
    date instanceof Date
      ? {
        type: 'normal',
        date,
        checkedWeeks: 0,
        calOpened: false,
        repeatEnd: { type: 'date', date: new Date(), weeks: 0 },
      }
      : {
        type: 'repeat',
        date: new Date(),
        checkedWeeks: date.pattern.bitSet,
        calOpened: false,
        repeatEnd: {
          type: 'date',
          date: date.endDate instanceof Date ? date.endDate : new Date(),
          weeks: date.endDate instanceof Date ? 0 : date.endDate,
        },
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
            {!(date instanceof Date)
            && <SamwiseIcon iconName="repeat" className={dateStyles.RepeatIcon} /> }
            {date instanceof Date ? date2String(date) : ` ${genNextValidDay(date.pattern.bitSet)}`}
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
  const changeRepeat = (e: ChangeEvent<HTMLSelectElement>): void => {
    setInternalDate({
      ...internalDate,
      type:
       e.currentTarget.value === 'true'
         ? 'repeat'
         : 'normal',
    });
  };

  /**
   * Event handler when checking or unchecking a weekday for repeating
   */
  const handleClickWeekday = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value, checked } = e.currentTarget;
    const val = parseInt(value, 10);

    setInternalDate(
      {
        ...internalDate,
        checkedWeeks: checked
          ? setDayOfWeek(internalDate.checkedWeeks, val)
          : unsetDayOfWeek(internalDate.checkedWeeks, val),
      },
    );
  };

  /**
   * The list of labels and inputs making up the seven weekdays users can check and uncheck
   */
  const weekdayPickers = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
    (x, i) => {
      const isDaySet = isDayOfWeekSet(internalDate.checkedWeeks, i);
      return (
        <label
          htmlFor={`newTaskRepeatInputCheck${i}`}
          style={isDaySet ? {
            background: '#5a5a5a', color: 'white',
          } : {}}
        >
          {x}
          <input
            id={`newTaskRepeatInputCheck${i}`}
            checked={isDaySet}
            value={i}
            onChange={handleClickWeekday}
            type="checkbox"
            name="repeatWeek"
          />
        </label>
      );
    },
  );

  /**
   * Event handler for choosing a repeat end option
   * @param e The onchange event
   */
  const handleClickEnd = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    const valNum = parseInt(value, 10);

    const newType: 'date' | 'weeks' = valNum === 0 ? 'date' : 'weeks';

    setInternalDate({
      ...internalDate,
      repeatEnd: {
        ...internalDate.repeatEnd,
        type: newType,
      },
    });
  };

  /**
   * Event handler for when the user starts the repeat box
   */
  const handleClickRepeatCal = (): void => {
    setInternalDate({ ...internalDate, calOpened: !internalDate.calOpened });
  };

  /**
   * Event handler for choosing a date to end the repeat
   * @param d The date chosen from the Calendar component
   */
  const handleSetRepeatEndDate = (d: Date | Date[]): void => {
    setInternalDate({
      ...internalDate,
      calOpened: false,
      repeatEnd: { ...internalDate.repeatEnd, date: d instanceof Array ? d[0] : d },
    });
  };

  /**
   * Event handler for choosing a repeat end option
   * @param e The onchange event
   */
  const handleSetRepeatNumber = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    setInternalDate({
      ...internalDate,
      repeatEnd: { ...internalDate.repeatEnd, weeks: parseInt(value, 10) },
    });
  };

  /**
   * Set the end of the date to a specified date
   * @param d The date to set the repeat end date
   */
  const testSetEndSem = (d: Date): void => {
    setInternalDate({
      ...internalDate,
      calOpened: false,
      repeatEnd: { type: 'date', date: d, weeks: internalDate.repeatEnd.weeks },
    });
  };


  /**
   * The list of li elements for all the repeat end options
   */
  const endPicker = internalDate.type === 'repeat' ? [
    <>
      On
      {' '}
      <button
        type="button"
        className={dateStyles.SubtleBtn}
        onClick={handleClickRepeatCal}
      >
        { internalDate.repeatEnd.date.toLocaleDateString() }
      </button>
      {
        internalDate.type === 'repeat'
        && internalDate.calOpened
        && (
          <div>
            <Calendar
              value={internalDate.repeatEnd instanceof Date ? internalDate.repeatEnd : new Date()}
              minDate={new Date()}
              onChange={handleSetRepeatEndDate}
              calendarType="US"
            />
            <p className={styles.RepeatSpecialEndDate}>
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
      <input
        value={internalDate.repeatEnd.weeks}
        onChange={handleSetRepeatNumber}
        min="1"
        max="30"
        step="1"
        type="number"
      />
      {' '}
      weeks
    </>,
  ].map((x, i) => {
    let checked = false;
    if (internalDate.type === 'repeat') {
      checked = i === 0
        ? internalDate.repeatEnd.type !== 'weeks'
        : internalDate.repeatEnd.type === 'weeks';
    }
    return (
      <li>
        <label htmlFor={`newTaskRepeatEndRadio${i}`}>
          <input
            type="radio"
            name="repeatEnd"
            id={`newTaskRepeatEndRadio${i}`}
            value={i}
            checked={checked}
            onChange={handleClickEnd}
          />
          {x}
        </label>
      </li>
    );
  }) : [];

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
   * Resets all the react states regarding repeating tasks
   */
  const resetRepeats = (): void => {
    setInternalDate({
      type: 'normal',
      date: new Date(),
      checkedWeeks: 0,
      calOpened: false,
      repeatEnd: { type: 'date', date: new Date(), weeks: 0 },
    });
  };

  /**
   * Event handler for when the user changes the calendar date
   */
  const onChange = (d: Date | Date[]): void => {
    setInternalDate({ ...internalDate, date: Array.isArray(d) ? d[0] : d });
  };

  /**
   * Event handler for when the user tries to save
   */
  const onSubmit = (): void => {
    if (internalDate.type === 'normal') {
      onDateChange(internalDate.date);
      return;
    }

    const bitSet = internalDate.checkedWeeks;

    // If they didn't pick any days to repeat on, don't save.
    if (bitSet === 0) { return; }

    let endDate;

    if (internalDate.repeatEnd.type === 'date') {
      endDate = internalDate.repeatEnd.date;
    } else {
      // TODO once database support exists, replace this with number of occurrances
      endDate = getDateAfterXWeeks(todayLastSecond, internalDate.repeatEnd.weeks);
    }

    const repData: RepeatMetaData = {
      startDate: todayFirstSecond,
      endDate,
      pattern: { type: 'WEEKLY', bitSet },
    };
    onDateChange(repData);
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
          {
            internalDate.type === 'normal'
            && <Calendar onChange={onChange} value={internalDate.date} minDate={new Date()} calendarType="US" />
          }
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
