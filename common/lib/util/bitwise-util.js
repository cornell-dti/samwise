/* eslint-disable no-bitwise */
/**
 * Number of days in a week (7)
 */
export const DAYS_IN_WEEK = 7;
/**
 * Whether a certain bit in a bitset is set
 * @param bit The bitset to check
 * @param d The position of the bit (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export const isBitSet = (bit, d, totalLen) => ((bit & (1 << (totalLen - 1 - d))) !== 0);
/**
 * Return a bitset with a certain bit set
 * @param bit The bitset to modify
 * @param index The position of the bit to set (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export const setBit = (bit, index, totalLen) => (bit | (1 << (totalLen - 1 - index)));
/**
 * Return a bitset with a certain bit unset
 * @param bit The bitset to modify
 * @param index The position of the bit to unset (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export const unsetBit = (bit, index, totalLen) => (bit & (~(1 << (totalLen - 1 - index))));
/**
 * Sets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const setDayOfWeek = (bit, d) => setBit(bit, d, DAYS_IN_WEEK);
/**
 * Unsets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const unsetDayOfWeek = (bit, d) => unsetBit(bit, d, DAYS_IN_WEEK);
/**
 * Whether a day of the week is set in a seven digit bitset.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export const isDayOfWeekSet = (bit, d) => isBitSet(bit, d, DAYS_IN_WEEK);
