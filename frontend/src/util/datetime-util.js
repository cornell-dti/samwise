// @flow strict

/**
 * Convert a day to a string.
 *
 * @param {number} day the day to convert, which must be between 0 to 6.
 * @return {string} the converted day string.
 */
export function day2String(day: number): string {
  switch (day) {
    case 0:
      return 'SUN';
    case 1:
      return 'MON';
    case 2:
      return 'TUE';
    case 3:
      return 'WED';
    case 4:
      return 'THU';
    case 5:
      return 'FRI';
    case 6:
      return 'SAT';
    default:
      throw new Error('Impossible Case');
  }
}

/**
 * Returns the formatted string of date.
 *
 * @param {Date} date the date to convert.
 * @return {string} the formatted date.
 */
export function date2String(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric',
  });
}

/**
 * Returns the formatted string of date with year.
 *
 * @param {Date} date the date to convert.
 * @return {string} the formatted date.
 */
export function date2FullDateString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

/**
 * Returns the formatted string of date with year and month.
 *
 * @param {Date} date the date to convert.
 * @return {string} the formatted date.
 */
export function date2YearMonth(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
}

/**
 * Returns today at 0.
 *
 * @return {Date} today at 0.
 */
export function getTodayAtZero(): Date {
  const d = new Date();
  d.setHours(0);
  return d;
}
