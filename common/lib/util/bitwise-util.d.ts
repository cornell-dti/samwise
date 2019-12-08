/**
 * Number of days in a week (7)
 */
export declare const DAYS_IN_WEEK = 7;
/**
 * Whether a certain bit in a bitset is set
 * @param bit The bitset to check
 * @param d The position of the bit (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export declare const isBitSet: (bit: number, d: number, totalLen: number) => boolean;
/**
 * Return a bitset with a certain bit set
 * @param bit The bitset to modify
 * @param index The position of the bit to set (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export declare const setBit: (bit: number, index: number, totalLen: number) => number;
/**
 * Return a bitset with a certain bit unset
 * @param bit The bitset to modify
 * @param index The position of the bit to unset (zero-indexed from the LEFT)
 * @param totalLen The length of the bitset
 */
export declare const unsetBit: (bit: number, index: number, totalLen: number) => number;
/**
 * Sets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export declare const setDayOfWeek: (bit: number, d: number) => number;
/**
 * Unsets a bit in a seven digit bitset representing week.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export declare const unsetDayOfWeek: (bit: number, d: number) => number;
/**
 * Whether a day of the week is set in a seven digit bitset.
 *
 * @param bit The bitset.
 * @param d The day of the week (zero-indexed from Sunday).
 * @param totalLen total length of the bitset.
 */
export declare const isDayOfWeekSet: (bit: number, d: number) => boolean;
