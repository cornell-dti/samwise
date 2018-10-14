// @flow

import type { SubTask } from '../../store/store-types';

/**
 * The type for a simplified task with just enough information needed to render the backlog
 * day component.
 */
export type SimpleTask = {|
  name: string;
  id: number;
  color: string;
  complete: boolean;
  subTasks: SubTask[];
|};

/**
 * All the tasks for one day.
 */
export type OneDayTask = {| date: Date; tasks: SimpleTask[] |};
