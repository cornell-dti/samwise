// @flow strict

/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
export const randomId = (): number => -100 - Math.floor(10000 * Math.random());

/**
 * Throw an error. Useful when want to use this as an expression.
 *
 * @param {?string} message an optional message.
 */
export function error(message?: string): empty { throw new Error(message); }
