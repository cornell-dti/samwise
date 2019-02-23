// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
// import Show from '../../../assets/svgs/show.svg';
// import Hide from '../../../assets/svgs/hide.svg';
import type { FutureViewContainerType, FutureViewDisplayOption } from './future-view-types';
import SquareTextButton from '../../UI/SquareTextButton';
import SquareIconToggle from '../../UI/SquareIconToggle';
import { date2YearMonth } from '../../../util/datetime-util';
import styles from './FutureViewControl.css';
import type { WindowSize } from '../../Util/Responsive/window-size-context';

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
  +windowSize: WindowSize;
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

type DisplayOptionControlProps = $Diff<Props, {| +windowSize: WindowSize; |}>;

/**
 * The component to control display options.
 *
 * @param {DisplayOptionControlProps} props all the props.
 * @return {Node} the rendered component.
 * @constructor
 */
function DisplayOptionControl(props: DisplayOptionControlProps): Node {
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
    windowSize: { width }, nDays, displayOption, offset, onChange,
  } = props;
  const { containerType } = displayOption;
  const changeOffset = (instruction: ChangeOffsetInstruction) => () => {
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
  const displayOptionControl = (
    <DisplayOptionControl
      nDays={nDays}
      displayOption={displayOption}
      offset={offset}
      onChange={onChange}
    />
  );
  if (width <= 600) {
    return (
      <div>
        <div className={styles.FutureViewControl}>
          <Title text="Future" />
          <Padding />
          {today}
          {displayOptionControl}
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
      {displayOptionControl}
    </div>
  );
}
