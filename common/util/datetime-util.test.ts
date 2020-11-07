import {
  day2String,
  isToday,
  getTodayAtZeroAM,
  getDateWithDateString,
  getDateAfterXWeeks,
} from './datetime-util';

it('day2String works', () => {
  expect(day2String(0)).toBe('SUN');
  expect(day2String(1)).toBe('MON');
  expect(day2String(2)).toBe('TUE');
  expect(day2String(3)).toBe('WED');
  expect(day2String(4)).toBe('THU');
  expect(day2String(5)).toBe('FRI');
  expect(day2String(6)).toBe('SAT');
});

it('today is today', () => {
  expect(isToday(new Date())).toBe(true);
});

it('getTodayAtZeroAM works', () => {
  const t = getTodayAtZeroAM();
  expect(t.getHours()).toBe(0);
  expect(t.getMinutes()).toBe(0);
  expect(t.getSeconds()).toBe(0);
  expect(t.getMilliseconds()).toBe(0);
});

it('getDateWithDateString works', () => {
  const date = getDateWithDateString(null, 'Tue Nov 03 2020');
  expect(date.getFullYear()).toBe(2020);
  expect(date.getMonth()).toBe(10);
  expect(date.getDate()).toBe(3);
});

it('getDateAfterXWeeks works', () => {
  const t1 = new Date(Date.UTC(2019, 11, 1));
  const expected = new Date(Date.UTC(2019, 11, 14));
  expect(getDateAfterXWeeks(t1, 2).getTime()).toBe(expected.getTime());
});
