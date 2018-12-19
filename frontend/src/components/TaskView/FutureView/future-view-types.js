// @flow strict

import type { Task } from '../../../store/store-types';

/**
 * The different displaying options for backlog.
 */
export type FutureViewDisplayOption = 'N_DAYS' | 'BIWEEKLY' | 'MONTHLY';

/**
 * The type for a task augmented with color information
 */
export type ColoredTask = {| ...Task; +color: string; |};

/**
 * All the tasks for one day.
 */
export type OneDayTask = {| +date: Date; +tasks: ColoredTask[]; |};
