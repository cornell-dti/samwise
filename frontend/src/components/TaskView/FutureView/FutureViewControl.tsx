import React, { ReactElement } from 'react';
import clsx from 'clsx';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { date2YearMonth } from 'common/util/datetime-util';
import { useTodayLastSecondTime } from '../../../hooks/time-hook';
import { FutureViewContainerType, FutureViewDisplayOption } from './future-view-types';
import SquareTextButton from '../../UI/SquareTextButton';
import SquareIconToggle from '../../UI/SquareIconToggle';
import styles from './FutureViewControl.module.scss';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';
import SamwiseIcon from '../../UI/SamwiseIcon';

/*
 * --------------------------------------------------------------------------------
 * Part 0: Common Types
 * --------------------------------------------------------------------------------
 */

type ChangeOffsetInstruction = 'TODAY' | number;
type ChangeableProps = {
  readonly displayOption: FutureViewDisplayOption;
  readonly offset: number;
};
type Props = ChangeableProps & {
  readonly nDays: number;
  readonly onChange: (change: Partial<ChangeableProps>) => void;
};

/*
 * --------------------------------------------------------------------------------
 * Part 1: Helper Small Components
 * --------------------------------------------------------------------------------
 */

/**
 * The padding span.
 */
const Padding = (): ReactElement => <span className={styles.ControlPadding} />;

/**
 * The title component.
 */
const Title = ({ text }: { readonly text: string }): ReactElement => (
  <h3 className={styles.Title}>{text}</h3>
);

/*
 * --------------------------------------------------------------------------------
 * Part 2: NavControl
 * --------------------------------------------------------------------------------
 */

type NavControlProps = {
  readonly today: Date;
  readonly containerType: FutureViewContainerType;
  readonly futureViewOffset: number;
  readonly changeOffset: (instruction: ChangeOffsetInstruction) => () => void;
  readonly isSmallScreen: boolean;
};

/**
 * Returns a suitable title for the backlog header title.
 *
 * @param {Date} today today from React hooks.
 * @param {number} monthOffset offset of displaying months.
 * @return {string} a suitable title for the backlog header title.
 */
function getMonthlyViewHeaderTitle(today: Date, monthOffset: number): string {
  const d = new Date(today);
  d.setMonth(d.getMonth() + monthOffset, 1);
  return date2YearMonth(d);
}

function getBiWeeklyViewHeaderTitle(today: Date, biweeklyOffset: number): string {
  const s = new Date(today);
  s.setDate(s.getDate() + biweeklyOffset * 14 - s.getDay()); // minus day offset
  const e = new Date(s);
  e.setDate(e.getDate() + 13);
  const startString = `${s.getMonth() + 1}/${s.getDate()}/${s.getFullYear() % 100}`;
  const endString = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear() % 100}`;
  return `${startString} - ${endString}`;
}

/**
 * The component to control nav.
 */
function NavControl(props: NavControlProps): ReactElement {
  const { today, containerType, futureViewOffset, changeOffset, isSmallScreen } = props;
  const prevHandler = changeOffset(-1);
  const nextHandler = changeOffset(+1);
  if (containerType === 'N_DAYS') {
    const offset = -10;
    const prevStyle = { left: offset };
    const nextStyle = { right: offset };
    return (
      <>
        {futureViewOffset >= 0 && (
          <SamwiseIcon
            iconName="arrow-down-dark"
            title="Go back"
            className={clsx(styles.NavButtonPrev, styles.NavButtonNDays)}
            style={prevStyle}
            onClick={prevHandler}
          />
        )}
        <SamwiseIcon
          iconName="arrow-down-dark"
          title="Go forward"
          className={clsx(styles.NavButtonNext, styles.NavButtonNDays)}
          style={nextStyle}
          onClick={nextHandler}
        />
      </>
    );
  }

  const prev = (
    <SamwiseIcon
      iconName="arrow-down-dark"
      title="Go back"
      className={styles.NavButtonPrev}
      onClick={prevHandler}
    />
  );
  const next = (
    <SamwiseIcon
      iconName="arrow-down-dark"
      title="Go forward"
      className={styles.NavButtonNext}
      onClick={nextHandler}
    />
  );
  if (containerType === 'BIWEEKLY') {
    return (
      <>
        {futureViewOffset >= 0 && prev}
        <Title text={getBiWeeklyViewHeaderTitle(today, futureViewOffset)} />
        {next}
      </>
    );
  }
  if (containerType === 'MONTHLY') {
    return (
      <>
        {!isSmallScreen && <Padding />}
        {futureViewOffset >= 0 && prev}
        <Title text={getMonthlyViewHeaderTitle(today, futureViewOffset)} />
        {next}
      </>
    );
  }
  throw new Error('Bad display option.');
}

/*
 * --------------------------------------------------------------------------------
 * Part 3: DisplayOptionControl
 * --------------------------------------------------------------------------------
 */

/**
 * The component to control display options
 */
function DisplayOptionControl({ nDays, displayOption, offset, onChange }: Props): ReactElement {
  const { containerType, doesShowCompletedTasks } = displayOption;
  const toggleCompletedTasks = (): void =>
    onChange({
      displayOption: { containerType, doesShowCompletedTasks: !doesShowCompletedTasks },
    });
  const switchContainerType = (newContainerType: FutureViewContainerType): void => {
    let dayOffset: number;
    switch (containerType) {
      case 'N_DAYS':
        dayOffset = offset * nDays;
        break;
      case 'BIWEEKLY':
        dayOffset = offset * 14;
        break;
      case 'MONTHLY':
        dayOffset = offset * 30;
        break;
      default:
        throw new Error('Bad container type!');
    }
    let newOffset: number;
    switch (newContainerType) {
      case 'N_DAYS':
        newOffset = Math.floor(dayOffset / nDays);
        break;
      case 'BIWEEKLY':
        newOffset = Math.floor(dayOffset / 14);
        break;
      case 'MONTHLY':
        newOffset = Math.floor(dayOffset / 30);
        break;
      default:
        throw new Error('Bad container type!');
    }
    onChange({
      displayOption: { containerType: newContainerType, doesShowCompletedTasks },
      offset: newOffset,
    });
  };
  const renderContainerTypeSwitcherButton = (
    type: FutureViewContainerType,
    text: string
  ): ReactElement => (
    <button
      type="button"
      title={`Change to ${text} view`}
      className={clsx(
        styles.ContainerTypeSwitcherButton,
        containerType === type && styles.ContainerTypeSwitcherActiveButton
      )}
      onClick={() => switchContainerType(type)}
    >
      <span className={styles.ContainerTypeSwitcherButtonText}>{text}</span>
    </button>
  );

  return (
    <>
      <SquareIconToggle
        active={doesShowCompletedTasks}
        iconNames={[faEyeSlash, faEye]}
        onToggle={toggleCompletedTasks}
      />
      <div className={styles.ContainerTypeSwitcher}>
        {renderContainerTypeSwitcherButton('N_DAYS', `${nDays}D`)}
        {renderContainerTypeSwitcherButton('BIWEEKLY', '2W')}
        {renderContainerTypeSwitcherButton('MONTHLY', 'M')}
      </div>
    </>
  );
}

/*
 * --------------------------------------------------------------------------------
 * Part 4: Main Component
 * --------------------------------------------------------------------------------
 */

/**
 * The controller component for the future view in task view.
 */
export default function FutureViewControl(props: Props): ReactElement {
  const { nDays, displayOption, offset, onChange } = props;
  const todayTime = useTodayLastSecondTime();
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 600);
  const { containerType } = displayOption;
  const changeOffset = (instruction: ChangeOffsetInstruction): (() => void) => (): void => {
    const newOffset = instruction === 'TODAY' ? 0 : offset + instruction;
    onChange({ offset: newOffset });
  };
  const today = offset !== 0 && <SquareTextButton text="Today" onClick={changeOffset('TODAY')} />;
  if (isSmallScreen) {
    return (
      <div>
        <div className={styles.FutureViewControl}>
          <Title text="Future" />
          <Padding />
          {today}
          <DisplayOptionControl
            nDays={nDays}
            displayOption={displayOption}
            offset={offset}
            onChange={onChange}
          />
        </div>
        <div className={styles.FutureViewControl}>
          <Padding />
          <NavControl
            today={todayTime}
            containerType={containerType}
            futureViewOffset={offset}
            changeOffset={changeOffset}
            isSmallScreen
          />
          <Padding />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.FutureViewControl}>
      <Title text="Future" />
      <NavControl
        today={todayTime}
        containerType={containerType}
        futureViewOffset={offset}
        changeOffset={changeOffset}
        isSmallScreen={false}
      />
      <Padding />
      {today}
      <DisplayOptionControl
        nDays={nDays}
        displayOption={displayOption}
        offset={offset}
        onChange={onChange}
      />
    </div>
  );
}
