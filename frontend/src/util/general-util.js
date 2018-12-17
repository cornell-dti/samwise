// @flow strict

/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
export const randomId = (): number => ((10 * new Date()) + Math.floor(1000 * Math.random()));
