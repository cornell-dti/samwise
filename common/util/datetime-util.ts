/**
 * @param {number} day the day to convert, which must be between 0 to 6.
 * @return {string} the converted day string. e.g. 0 ==> 'SUN', 3 ==> 'WED'.
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
 * @param {Date} date the date to convert.
 * @return {string} the formatted string of date.
 */
export function date2String(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  });
}

/**
 * @param {Date} date the date to convert.
 * @return {string} the formatted string of date with year.
 */
export function date2FullDateString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * @param {Date} date the date to convert.
 * @return {string} formatted string of date with year and month.
 */
export function date2YearMonth(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * @return {Date} today at 0 AM.
 */
export function getTodayAtZeroAM(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check whether a given date is today.
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

/**
 * @param date the date object to provide time information.
 * @param dateString the date string to apply.
 * @returns a new date object with the date info in the date string applied.
 */
export function getDateWithDateString(date: Date | null, dateString: string): Date {
  const newDate = date === null ? new Date() : new Date(date);
  const dateInfo = new Date(dateString);
  newDate.setFullYear(dateInfo.getFullYear());
  newDate.setDate(1);
  newDate.setMonth(dateInfo.getMonth());
  newDate.setDate(dateInfo.getDate());
  if (date === null) {
    // Default to last second of the day.
    newDate.setHours(23, 59, 59);
  }
  return newDate;
}

/**
 * returns the same date x weeks - 1 day later
 * example: monday oct 1, 2 weeks later returnes sunday the 14th
 *
 * @param date
 * @param x
 */
export function getDateAfterXWeeks(date: Date, x: number): Date {
  const oneDay = 1000 * 60 * 60 * 24;
  return new Date(date.getTime() + oneDay * 7 * x - oneDay);
}
