import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import SamwiseIcon from '../../../UI/SamwiseIcon';
import { State, Tag, RepeatingPattern, RepeatingTask } from '../../../../store/store-types';
import { DAYS_IN_WEEK, isBitSet } from '../../../../util/bitwise-util';
import styles from './RepeatFrequencyHeader.module.css';

type OwnProps = {
  readonly taskId: string;
  readonly tag: string;
  readonly getTag: (id: string) => Tag;
};

type Props = OwnProps & { readonly pattern: RepeatingPattern | null };

type BinaryCount = { binary: number; count: number };

const arrOfWeeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const patternTypeToString = (patternType: string): string => {
  switch (patternType) {
    case 'WEEKLY': return 'week';
    case 'BIWEEKLY': return 'two weeks';
    case 'MONTHLY': return 'month';
    default:
      throw new Error();
  }
};

const bitsetToBinaryCount = (bit: number): BinaryCount => {
  let binary = 0;
  let count = 0;
  for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
    if (isBitSet(bit, i, DAYS_IN_WEEK)) {
      binary += (1 * 10 ** (DAYS_IN_WEEK - 1 - i));
      count += 1;
    }
  }
  return { binary, count };
};

const getRepeatedDays = ({ type, bitSet }: RepeatingPattern): string => {
  const frequency = bitsetToBinaryCount(bitSet);
  const { binary, count } = frequency;
  if (count > 2) {
    return `Repeats ${count} days every ${patternTypeToString(type)}`;
  }

  const repeatedDays = Array<string>();
  let binaryFrequency = binary;
  let index = DAYS_IN_WEEK - 1;
  while (binaryFrequency > 0) {
    if (binaryFrequency % 10 === 1) {
      repeatedDays.push(arrOfWeeks[index]);
    }
    binaryFrequency = Math.round(binaryFrequency / 10);
    index -= 1;
  }
  return `Repeats every ${repeatedDays.reverse().join(', ')}`;
};

function RepeatFrequencyHeader(
  { pattern, tag, getTag }: Props,
): ReactElement | null {
  if (pattern == null) {
    return null;
  }

  return (
    <div className={styles.Header} style={{ color: getTag(tag).color }}>
      <SamwiseIcon iconName="repeat-frequency" className={styles.Icon} />
      {getRepeatedDays(pattern)}
    </div>
  );
}

const getRepeatingPattern = (
  { tasks, repeatedTaskSet }: State,
  taskId: string,
): RepeatingPattern | null => {
  const repeatedTaskIds = repeatedTaskSet.toArray();
  for (let i = 0; i < repeatedTaskIds.length; i += 1) {
    const repeatedTaskId = repeatedTaskIds[i];
    const repeatingTask = tasks.get(repeatedTaskId) as RepeatingTask | undefined;
    if (repeatingTask != null) {
      const { date: { pattern }, forks } = repeatingTask;
      if (taskId === repeatedTaskId) {
        return pattern;
      }
      for (let j = 0; j < forks.length; j += 1) {
        const { forkId } = forks[j];
        if (forkId === taskId) {
          return pattern;
        }
      }
    }
  }
  return null;
};

const Connected = connect(
  (state: State, { taskId }: OwnProps) => ({ pattern: getRepeatingPattern(state, taskId) }),
)(RepeatFrequencyHeader);
export default Connected;
