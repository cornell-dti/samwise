// @flow strict

/**
 * Convert a day to a string.
 *
 * @param {number} month the month to convert, which must be between 0 to 11.
 * @return {string} the converted month string.
 */
export function month2String(month: number): string {
  switch (month) {
    case 0:
      return 'January';
    case 1:
      return 'February';
    case 2:
      return 'March';
    case 3:
      return 'April';
    case 4:
      return 'May';
    case 5:
      return 'June';
    case 6:
      return 'July';
    case 7:
      return 'August';
    case 8:
      return 'September';
    case 9:
      return 'October';
    case 10:
      return 'November';
    case 11:
      return 'December';
    default:
      throw new Error('Bad Month!');
  }
}

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
export function date2StringWithYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}
