import React, { ReactElement, SyntheticEvent, ChangeEvent } from 'react';
import Calendar from 'react-calendar';
import styles from './Picker.module.css';
import dateStyles from './DatePicker.module.css';
import { date2String } from '../../util/datetime-util';
import { NONE_TAG } from '../../util/tag-util';
import SamwiseIcon from '../UI/SamwiseIcon';

type Props = {
  readonly onDateChange: (date: Date | null) => void;
  readonly date: Date;
  readonly opened: boolean;
  readonly datePicked: boolean;
  readonly onPickerOpened: () => void;
  readonly onClearPicker: () => void;
};

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

  /**
   * Whether or not this task is a repeating task.
   */
  const [isRepeat, setIsRepeat] = React.useState<boolean>(false);

  /**
   * Event handler for when the user starts the repeat box
   */
  const changeRepeat = (e: ChangeEvent): void => { setIsRepeat((e.target as HTMLSelectElement).value === 'true'); };

  /**
   * The state to keep track of which days the user would like to repeat
   */
  const [checkedWeeks, setCheckedWeeks] = React.useState<boolean[]>(
    new Array(7).fill(false),
  );

  /**
   * Event handler when checking or unchecking a weekday for repeating
   */
  const handleClickWeekday = (e: ChangeEvent): void => {
    const { value, checked } = e.target as HTMLInputElement;
    const val = parseInt(value, 10);
    setCheckedWeeks(checkedWeeks.map((x, i) => (i === val ? checked : x)));
  };

  /**
   * The list of labels and inputs making up the seven weekdays users can check and uncheck
   */
  const weekdayPickers = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].reduce(
    (a, x, i) => (
      <>
        {a}
        <label
          htmlFor={`newTaskRepeatInputCheck${i}`}
          style={checkedWeeks[i] ? {
            background: '#5a5a5a', color: 'white',
          } : {}}
        >
          {x}
          <input
            id={`newTaskRepeatInputCheck${i}`}
            checked={checkedWeeks[i]}
            value={i}
            onChange={handleClickWeekday}
            type="checkbox"
            name="repeatWeek"
          />
        </label>
      </>
    ), <></>,
  );

  /**
   * The state to keep track of which repeat end option the user has chosen.
   * -1 means the user has not selected an option yet
   */
  const [endOption, setEndOption] = React.useState<number>(-1);

  /**
   * Event handler for choosing a repeat end option
   * @param e The onchange event
   */
  const handleClickEnd = (e: ChangeEvent): void => {
    const { value } = e.target as HTMLInputElement;
    setEndOption(parseInt(value, 10));
  };

  /**
   * Whether or not this task is a repeating task.
   */
  const [calOpened, setCalOpened] = React.useState<boolean>(false);

  /**
   * Event handler for when the user starts the repeat box
   */
  const handleClickRepeatCal = (): void => { setCalOpened(!calOpened); };


  /**
   * The list of li elements for all the repeat end options
   */
  const endPicker = [
    <>At the end of the semester</>,
    <>
      On
      {' '}
      <button
        type="button"
        className={dateStyles.SubtleBtn}
        onClick={handleClickRepeatCal}
      >
        April 19, 2019
      </button>
      {calOpened && <Calendar minDate={new Date()} calendarType="US" />}
    </>,
    <>
      After
      {' '}
      <input min="1" max="30" step="1" type="number" />
      {' '}
      occurances
    </>,
  ].reduce((a, x, i) => (
    <>
      {a}
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
  ), <></>);

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
  const [currDate, setCurrDate] = React.useState<Date>(date);

  /**
   * Resets all the react states regarding repeating tasks
   */
  const resetRepeats = (): void => {
    setCheckedWeeks(new Array(7).fill(false));
    setEndOption(-1);
    setIsRepeat(false);
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
    resetRepeats();
    onDateChange(currDate);
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
              value={isRepeat.toString()}
              onChange={changeRepeat}
            >
              <option value="false">One-Time</option>
              <option value="true">Repeating</option>
            </select>
          </p>
          {!isRepeat && <Calendar onChange={onChange} value={date} minDate={new Date()} calendarType="US" />}
          {isRepeat && openedRepeat}
          <p className={styles.NewTaskDateSave}>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="button" onClick={onSubmit}>Done</button>
          </p>
        </div>
      )}
    </div>
  );
}
