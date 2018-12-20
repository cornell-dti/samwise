// @flow strict

import type { Task } from '../../../store/store-types';

/**
 * The different container types.
 */
export type FutureViewContainerType = 'N_DAYS' | 'BIWEEKLY' | 'MONTHLY';
/**
 * All the display options of future view.
 */
export type FutureViewDisplayOption = {|
  +containerType: FutureViewContainerType;
  +doesShowCompletedTasks: boolean;
|};

/**
 * The type for a task augmented with color information and filtered task.
 */
export type CompoundTask = {|
  +original: Task;
  +filtered: Task;
  +color: string;
|};

/**
 * All the tasks for one day.
 */
export type OneDayTask = {| +date: Date; +tasks: CompoundTask[]; |};
