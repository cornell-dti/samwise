// @flow strict

import type { FutureViewDisplayOption, ColoredTask, OneDayTask } from './future-view-types';
import type { Tag, SubTask, Task } from '../../../store/store-types';
import { month2String } from '../../../util/datetime-util';
import { getColorByTagId } from '../../../util/tag-util';

export type DateToTaskMap = Map<string, Task[]>;

/**
 * Compute the start date and end date.
 *
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewDisplayOption} displayOption the display option of the backlog days container.
 * @param {number} backlogOffset offset of displaying days.
 * @return {{startDate: Date, endDate: Date}} the start date and end date.
 */
function computeStartAndEndDay(
  nDays: number, displayOption: FutureViewDisplayOption, backlogOffset: number,
): {| +startDate: Date; endDate: Date |} {
  // Compute start date (the first date to display)
  const startDate = new Date();
  let hasAdditionalDays = false;
  switch (displayOption) {
    case 'N_DAYS':
      startDate.setDate(startDate.getDate() + backlogOffset * nDays);
      break;
    case 'BIWEEKLY':
      startDate.setDate(startDate.getDate() - startDate.getDay() + backlogOffset * 14);
      break;
    case 'MONTHLY':
      startDate.setMonth(startDate.getMonth() + backlogOffset, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      hasAdditionalDays = startDate.getDate() !== 1;
      break;
    default:
  }
  // Compute end date (the first date not to display)
  let endDate = new Date(startDate); // the first day not to display.
  switch (displayOption) {
    case 'N_DAYS':
      endDate.setDate(endDate.getDate() + nDays);
      break;
    case 'BIWEEKLY':
      endDate.setDate(endDate.getDate() + 14);
      break;
    case 'MONTHLY':
      if (hasAdditionalDays) {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 2, 1);
      } else {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      }
      break;
    default:
      throw new Error('Impossible Case');
  }
  return { startDate, endDate };
}

/**
 * Returns a suitable title for the backlog header title.
 *
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewDisplayOption} displayOption the display option.
 * @param {number} backlogOffset offset of displaying days.
 * @return {string} a suitable title for the backlog header title.
 */
export function getBacklogHeaderTitle(
  nDays: number, displayOption: FutureViewDisplayOption, backlogOffset: number,
): string {
  if (displayOption === 'N_DAYS' || displayOption === 'BIWEEKLY') {
    const { startDate, endDate } = computeStartAndEndDay(nDays, displayOption, backlogOffset);
    endDate.setDate(endDate.getDate() - 1);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
  if (displayOption === 'MONTHLY') {
    const d = new Date();
    d.setMonth(d.getMonth() + backlogOffset, 1);
    return `${month2String(d.getMonth())} ${d.getFullYear()}`;
  }
  throw new Error('Bad display option!');
}

/**
 * Returns an array of backlog days given the current props and the display option.
 *
 * @param {DateToTaskMap} date2TaskMap the map from a date to all the tasks in that day.
 * @param {Tag[]} tags all the color config.
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewDisplayOption} displayOption the display option.
 * @param {number} backlogOffset offset of displaying days.
 * @return {OneDayTask[]} an array of backlog days information.
 */
export function buildDaysInBacklog(
  date2TaskMap: DateToTaskMap, tags: Tag[], nDays: number,
  displayOption: FutureViewDisplayOption, backlogOffset: number,
): OneDayTask[] {
  const { startDate, endDate } = computeStartAndEndDay(nDays, displayOption, backlogOffset);
  // Adding the days to array
  const days: OneDayTask[] = [];
  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasksOnThisDay = date2TaskMap.get(date.toLocaleDateString()) || [];
    const tasks = tasksOnThisDay.map((task: Task) => {
      const { tag } = task;
      return { ...task, color: getColorByTagId(tags, tag) };
    });
    days.push({ date, tasks });
  }
  return days;
}

/**
 * Returns the total number of tasks in the given task array.
 *
 * @param {ColoredTask[]} tasks the given task array.
 * @param {boolean} includeSubTasks whether to include subtasks.
 * @param {boolean} includeCompletedTasks whether to include completed tasks.
 * @return {number} total number of tasks, including main task and subtasks.
 */
export function countTasks(
  tasks: ColoredTask[], includeSubTasks: boolean, includeCompletedTasks: boolean,
): number {
  if (!includeSubTasks) {
    return tasks.length;
  }
  const subtaskReducer = (a: number, s: SubTask) => (
    a + ((includeCompletedTasks || s.complete) ? 1 : 0)
  );
  const reducer = (a: number, t: ColoredTask): number => (
    a + ((includeCompletedTasks || t.complete) ? 1 : 0) + t.subtaskArray.reduce(subtaskReducer, 0)
  );
  return tasks.reduce(reducer, 0);
}
