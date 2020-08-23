import {
  isBitSet,
  setBit,
  unsetBit,
  isDayOfWeekSet,
  setDayOfWeek,
  unsetDayOfWeek,
  DAYS_IN_WEEK,
} from './bitwise-util';

it('Test isBitSet', () => {
  expect(isBitSet(1, 0, 1)).toEqual(true);
  expect(isBitSet(0, 0, 1)).toEqual(false);
  expect(isBitSet(2, 0, 2)).toEqual(true);
  expect(isBitSet(2, 8, 10)).toEqual(true);
  expect(isBitSet(2, 1, 2)).toEqual(false);
  expect(isBitSet(3, 1, 2)).toEqual(true);
  const everyDaySet = 2 ** DAYS_IN_WEEK - 1;
  for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
    expect(isBitSet(everyDaySet, i, DAYS_IN_WEEK)).toEqual(true);
  }
});

it('Test setBit', () => {
  expect(setBit(0, 0, 1)).toEqual(1);
  expect(setBit(1, 0, 1)).toEqual(1);
  expect(setBit(2, 1, 2)).toEqual(3);
  expect(setBit(3, 1, 2)).toEqual(3);
  expect(setBit(102, 3, 7)).toEqual(110);
  expect(setBit(127, 3, 7)).toEqual(127);
});

it('Test unsetBit', () => {
  expect(unsetBit(0, 0, 1)).toEqual(0);
  expect(unsetBit(1, 0, 1)).toEqual(0);
  expect(unsetBit(2, 1, 2)).toEqual(2);
  expect(unsetBit(3, 1, 2)).toEqual(2);
  expect(unsetBit(102, 4, 7)).toEqual(98);
  expect(unsetBit(127, 3, 7)).toEqual(119);
});

it('Test isDayOfWeekSet', () => {
  const everyDaySet = 2 ** DAYS_IN_WEEK - 1;
  for (let i = 0; i < DAYS_IN_WEEK; i += 1) {
    expect(isDayOfWeekSet(everyDaySet, i)).toEqual(true);
  }
  expect(isDayOfWeekSet(100, 0)).toEqual(true);
  expect(isDayOfWeekSet(100, 1)).toEqual(true);
  expect(isDayOfWeekSet(100, 2)).toEqual(false);
  expect(isDayOfWeekSet(100, 3)).toEqual(false);
  expect(isDayOfWeekSet(100, 4)).toEqual(true);
  expect(isDayOfWeekSet(100, 5)).toEqual(false);
  expect(isDayOfWeekSet(100, 6)).toEqual(false);
});

it('Test setDayOfWeek', () => {
  expect(setDayOfWeek(102, 3)).toEqual(110);
  expect(setDayOfWeek(127, 3)).toEqual(127);
});

it('Test unsetDayOfWeek', () => {
  expect(unsetDayOfWeek(102, 4)).toEqual(98);
  expect(unsetDayOfWeek(127, 3)).toEqual(119);
});
