/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
export const randomId = (): string => String(new Date().getTime());

/**
 * The identity function.
 */
export function identity<T>(t: T): T { return t; }

/**
 * An empty function used to ignore promise.
 */
export const ignore = (): void => {};

/**
 * Throw an error. Useful when want to use this as an expression.
 *
 * @param {?string} message an optional message.
 */
export const error = (message?: string): never => { throw new Error(message); };
