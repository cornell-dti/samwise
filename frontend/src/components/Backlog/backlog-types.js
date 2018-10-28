// @flow

import type { Task } from '../../store/store-types';

/**
 * The type for a task augmented with color information
 */
export type ColoredTask = {| ...Task; color: string; |};

/**
 * All the tasks for one day.
 */
export type OneDayTask = {| date: Date; tasks: ColoredTask[] |};
