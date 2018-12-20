// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import type { FutureViewContainerType, FutureViewDisplayOption } from './future-view-types';
import SquareTextToggle from '../../UI/SquareTextToggle';
import SquareIconToggle from '../../UI/SquareIconToggle';
import { date2YearMonth } from '../../../util/datetime-util';
import styles from './FutureViewControl.css';

/*
 * --------------------------------------------------------------------------------
 * Part 0: Common Types
 * --------------------------------------------------------------------------------
 */

type ChangeOffsetInstruction = 'TODAY' | number;
type ChangeableProps = {|
  +displayOption: FutureViewDisplayOption;
  +offset: number;
|};
type Props = {|
  +nDays: number;
  ...ChangeableProps;
  +onChange: ($Shape<ChangeableProps>) => void;
|};

/*
 * --------------------------------------------------------------------------------
 * Part 1: Helper Small Components
 * --------------------------------------------------------------------------------
 */

/**
 * The padding span.
 *
 * @return {Node} the rendered padding span.
 * @constructor
 */
const Padding = (): Node => <span className={styles.ControlPadding} />;

/**
 * The title component.
 *
 * @param {string} text the title text.
 * @return {Node} the rendered title.
 * @constructor
 */
const Title = ({ text }: {| +text: string |}): Node => (
  <h3 className={styles.Title}>{text}</h3>
);

/*
 * --------------------------------------------------------------------------------
 * Part 2: NavControl
 * --------------------------------------------------------------------------------
 */

type NavControlProps = {|
  +containerType: FutureViewContainerType;
  +futureViewOffset: number;
  +changeOffset: (ChangeOffsetInstruction) => () => void;
|};

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

/**
 * The component to control nav.
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered component.
 * @constructor
 */
function NavControl(props: NavControlProps): Node {
  const { containerType, futureViewOffset, changeOffset } = props;
  const today = futureViewOffset !== 0 && (
    <SquareTextToggle text="Today" onClick={changeOffset('TODAY')} />
  );
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
        <Padding />
        {today}
      </React.Fragment>
    );
  }
  const prev = <Icon className={styles.NavButton} name="chevron left" onClick={prevHandler} />;
  const next = <Icon className={styles.NavButton} name="chevron right" onClick={nextHandler} />;
  if (containerType === 'BIWEEKLY') {
    return (
      <React.Fragment>
        {futureViewOffset >= 0 && prev}
        {next}
        <Padding />
        {today}
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
        <Padding />
        {today}
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
 * The component to control display options.
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered component.
 * @constructor
 */
function DisplayOptionControl(props: Props): Node {
  const {
    nDays, displayOption, offset, onChange,
  } = props;
  const { containerType, doesShowCompletedTasks } = displayOption;
  const toggleCompletedTasks = () => onChange({
    displayOption: { containerType, doesShowCompletedTasks: !doesShowCompletedTasks },
  });
  const switchContainerType = (newContainerType: FutureViewContainerType) => {
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
        newOffset = Math.floor(dayOffset / 4);
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
  const renderContainerTypeSwitcherButton = (type: FutureViewContainerType, text: string) => {
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
 *
 * @param {Props} props all the props.
 * @return {Node} the rendered controller.
 * @constructor
 */
export default function FutureViewControl(props: Props): Node {
  const {
    nDays, displayOption, offset, onChange,
  } = props;
  const { containerType } = displayOption;
  const changeOffset = (instruction: ChangeOffsetInstruction) => () => {
    const newOffset = instruction === 'TODAY' ? 0 : (offset + instruction);
    onChange({ offset: newOffset });
  };
  return (
    <div className={styles.FutureViewControl}>
      <Title text="Future" />
      <NavControl
        containerType={containerType}
        futureViewOffset={offset}
        changeOffset={changeOffset}
      />
      <DisplayOptionControl
        nDays={nDays}
        displayOption={displayOption}
        offset={offset}
        onChange={onChange}
      />
    </div>
  );
}
