/* eslint-disable no-bitwise */

/**
 * Number of days in a week (7)
 */
export const DAYS_IN_WEEK = 7;

/**
 * Sets a bit in a seven digit bitset representing week
 * @param bit The bitset
 * @param d The day of the week (zero-indexed from Sunday)
 */
export const setDayOfWeek = (bit: number, d: number): number => (bit | (1 << (DAYS_IN_WEEK - d)));

/**
 * Unsets a bit in a seven digit bitset representing week
 * @param bit The bitset
 * @param d The day of the week (zero-indexed from Sunday)
 */
export const unsetDayOfWeek = (bit: number, d: number): number => (
  bit & (~(1 << (DAYS_IN_WEEK - d)))
);

/**
 * Whether a day of the week is set in a seven digit bitset
 * @param bit The bitset
 * @param d The day of the week (zero-indexed from Sunday)
 */
export const isDayOfWeekSet = (bit: number, d: number): boolean => (
  bit & (1 << (DAYS_IN_WEEK - d))) !== 0;
