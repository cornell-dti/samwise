/* eslint-disable no-bitwise */

/**
 * Number of days in a week (7)
 */
export const DAYS_IN_WEEK = 7;

export const isBitSet = (bit: number, d: number, totalLen: number): boolean => (
  (bit & (1 << (totalLen - d))) !== 0
);

export const setBit = (bit: number, index: number, totalLen: number): number => (
  bit | (1 << (totalLen - index))
);

export const unsetBit = (bit: number, index: number, totalLen: number): number => (
  bit & (~(1 << (totalLen - index)))
);

/**
 * Sets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const setDayOfWeek = (bit: number, d: number): number => setBit(bit, d, DAYS_IN_WEEK - 1);

/**
 * Unsets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const unsetDayOfWeek = (bit: number, d: number): number => (
  unsetBit(bit, d, DAYS_IN_WEEK - 1)
);

/**
 * Whether a day of the week is set in a seven digit bitset.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const isDayOfWeekSet = (bit: number, d: number): boolean => (
  isBitSet(bit, d, DAYS_IN_WEEK - 1)
);
