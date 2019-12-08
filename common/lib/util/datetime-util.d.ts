/**
 * @param {number} day the day to convert, which must be between 0 to 6.
 * @return {string} the converted day string. e.g. 0 ==> 'SUN', 3 ==> 'WED'.
 */
export declare function day2String(day: number): string;
/**
 * @param {Date} date the date to convert.
 * @return {string} the formatted string of date.
 */
export declare function date2String(date: Date): string;
/**
 * @param {Date} date the date to convert.
 * @return {string} the formatted string of date with year.
 */
export declare function date2FullDateString(date: Date): string;
/**
 * @param {Date} date the date to convert.
 * @return {string} formatted string of date with year and month.
 */
export declare function date2YearMonth(date: Date): string;
/**
 * @return {Date} today at 0 AM.
 */
export declare function getTodayAtZeroAM(): Date;
/**
 * Check whether a given date is today.
 */
export declare function isToday(date: Date): boolean;
/**
 * @param date the date object to provide time information.
 * @param dateString the date string to apply.
 * @returns a new date object with the date info in the date string applied.
 */
export declare function getDateWithDateString(date: Date | null, dateString: string): Date;
/**
 * returns the same date x weeks - 1 day later
 * example: monday oct 1, 2 weeks later returnes sunday the 14th
 *
 * @param date
 * @param x
 */
export declare function getDateAfterXWeeks(date: Date, x: number): Date;
