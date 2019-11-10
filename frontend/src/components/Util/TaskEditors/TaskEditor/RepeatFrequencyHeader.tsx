import React, { ReactElement } from 'react';
import SamwiseIcon from '../../../UI/SamwiseIcon';
import { Tag, RepeatMetaData } from '../../../../store/store-types';
import { DAYS_IN_WEEK, isBitSet } from '../../../../util/bitwise-util';

type Props = {
  readonly date: Date | RepeatMetaData;
  readonly tag: string;
  readonly getTag: (id: string) => Tag;
};

type BinaryCount = {
  binary: number;
  count: number;
}

export default function RepeatFrequencyHeader(
  { date, tag, getTag }: Props,
): ReactElement | null {
  if (date instanceof Date) {
    return null;
  }

  const frequencyHeaderStyle = {
    color: getTag(tag).color,
    background: 'rgba(255, 255, 255, 0.6)',
    padding: '3px',
    height: '100%',
    fontSize: '10px',
  };

  const repeatIconStyle = {
    fill: '#FFFFFF',
    marginRight: '4px',
    marginBottom: '-5px',
    height: '16px',
    width: '16px',
  };

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

  const arrOfWeeks = ['Sunday', 'Monday', 'Tuesday',
    'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getRepeatedDays = (bit: number): string => {
    const frequency = bitsetToBinaryCount(bit);
    const { binary, count } = frequency;
    if (count > 2) {
      return `Repeats ${count} days every ${patternTypeToString(date.pattern.type)}`;
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
    return `Repeats every ${repeatedDays.reverse().join(", ")}`;
  };

  return (
    <div style={frequencyHeaderStyle}>
      <SamwiseIcon
        iconName="repeat-frequency"
        style={repeatIconStyle}
      />
      {getRepeatedDays(date.pattern.bitSet)}
    </div>
  );
}
