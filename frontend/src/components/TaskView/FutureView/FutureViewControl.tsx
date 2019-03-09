import React, { ReactElement } from 'react';
import { Icon } from 'semantic-ui-react';
// import Show from '../../../assets/svgs/show.svg';
// import Hide from '../../../assets/svgs/hide.svg';
import { FutureViewContainerType, FutureViewDisplayOption } from './future-view-types';
import SquareTextButton from '../../UI/SquareTextButton';
import SquareIconToggle from '../../UI/SquareIconToggle';
import { date2YearMonth } from '../../../util/datetime-util';
import styles from './FutureViewControl.css';
import { useMappedWindowSize } from '../../../hooks/window-size-hook';

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
  readonly containerType: FutureViewContainerType;
  readonly futureViewOffset: number;
  readonly changeOffset: (instruction: ChangeOffsetInstruction) => () => void;
};

/**
 * Returns a suitable title for the backlog header title.
 *
 * @param {number} monthOffset offset of displaying months.
 * @return {string} a suitable title for the backlog header title.
 */
function getMonthlyViewHeaderTitle(monthOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset, 1);
  return date2YearMonth(d);
}

function getBiWeeklyViewHeaderTitle(biweeklyOffset: number): string {
  const s = new Date();
  s.setDate(s.getDate() + biweeklyOffset * 14 - s.getDay()); // minus day offset
  const e = new Date(s);
  e.setDate(e.getDate() + 13);
  const startString = `${s.getMonth() + 1}/${s.getDate()}/${s.getFullYear()}`;
  const endString = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()}`;
  return `${startString} - ${endString}`;
}

/**
 * The component to control nav.
 */
function NavControl(props: NavControlProps): ReactElement {
  const { containerType, futureViewOffset, changeOffset } = props;
  const prevHandler = changeOffset(-1);
  const nextHandler = changeOffset(+1);
  if (containerType === 'N_DAYS') {
    const className = `${styles.NavButton} ${styles.NavButtonNDays}`;
    const prevStyle = { left: 0 };
    const nextStyle = { right: 0 };
    return (
      <React.Fragment>
        {futureViewOffset >= 1 && (
          <Icon className={className} style={prevStyle} name="chevron left" onClick={prevHandler} />
        )}
        <Icon className={className} style={nextStyle} name="chevron right" onClick={nextHandler} />
      </React.Fragment>
    );
  }
  const prev = <Icon className={styles.NavButton} name="chevron left" onClick={prevHandler} />;
  const next = <Icon className={styles.NavButton} name="chevron right" onClick={nextHandler} />;
  if (containerType === 'BIWEEKLY') {
    return (
      <React.Fragment>
        {futureViewOffset >= 0 && prev}
        <Title text={getBiWeeklyViewHeaderTitle(futureViewOffset)} />
        {next}
      </React.Fragment>
    );
  }
  if (containerType === 'MONTHLY') {
    return (
      <React.Fragment>
        <Padding />
        {futureViewOffset >= 1 && prev}
        <Title text={getMonthlyViewHeaderTitle(futureViewOffset)} />
        {next}
      </React.Fragment>
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
  const toggleCompletedTasks = (): void => onChange({
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
    type: FutureViewContainerType, text: string,
  ): ReactElement => {
    const className = containerType === type
      ? `${styles.ContainerTypeSwitcherButton} ${styles.ContainerTypeSwitcherActiveButton}`
      : styles.ContainerTypeSwitcherButton;
    return (
      <button type="button" className={className} onClick={() => switchContainerType(type)}>
        <span className={styles.ContainerTypeSwitcherButtonText}>{text}</span>
      </button>
    );
  };
  return (
    <React.Fragment>
      <SquareIconToggle
        active={doesShowCompletedTasks}
        iconNames={['eye slash', 'eye']}
        onToggle={toggleCompletedTasks}
      />
      <div className={styles.ContainerTypeSwitcher}>
        {renderContainerTypeSwitcherButton('N_DAYS', `${nDays}D`)}
        {renderContainerTypeSwitcherButton('BIWEEKLY', '2W')}
        {renderContainerTypeSwitcherButton('MONTHLY', 'M')}
      </div>
    </React.Fragment>
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
  const { displayOption, offset, onChange } = props;
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 600);
  const { containerType } = displayOption;
  const changeOffset = (instruction: ChangeOffsetInstruction): (() => void) => (): void => {
    const newOffset = instruction === 'TODAY' ? 0 : (offset + instruction);
    onChange({ offset: newOffset });
  };
  const today = offset !== 0 && (
    <SquareTextButton text="Today" onClick={changeOffset('TODAY')} />
  );
  const navControl = (
    <NavControl
      containerType={containerType}
      futureViewOffset={offset}
      changeOffset={changeOffset}
    />
  );
  if (isSmallScreen) {
    return (
      <div>
        <div className={styles.FutureViewControl}>
          <Title text="Future" />
          <Padding />
          {today}
          <DisplayOptionControl {...props} />
        </div>
        <div className={styles.FutureViewControl}>
          <Padding />
          {navControl}
          <Padding />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.FutureViewControl}>
      <Title text="Future" />
      {navControl}
      <Padding />
      {today}
      <DisplayOptionControl {...props} />
    </div>
  );
}
