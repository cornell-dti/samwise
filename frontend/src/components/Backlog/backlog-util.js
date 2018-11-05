// @flow strict

import type { BacklogDisplayOption, OneDayTask } from './backlog-types';
import type { TagColorConfig, Task } from '../../store/store-types';

export type DateToTaskMap = Map<string, Task[]>;

/**
 * Compute the start date and end date.
 *
 * @param {BacklogDisplayOption} displayOption the display option of the backlog days container.
 * @param {number} backlogOffset offset of displaying days.
 * @return {{startDate: Date, endDate: Date}} the start date and end date.
 */
function computeStartAndEndDay(
  displayOption: BacklogDisplayOption, backlogOffset: number,
): {| +startDate: Date; endDate: Date |} {
  // Compute start date (the first date to display)
  const startDate = new Date();
  let hasAdditionalDays = false;
  switch (displayOption) {
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
    case 'FOUR_DAYS':
      endDate.setDate(endDate.getDate() + 4);
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
 * @param {BacklogDisplayOption} displayOption the display option.
 * @param {number} backlogOffset offset of displaying days.
 * @return {string} a suitable title for the backlog header title.
 */
export function getBacklogHeaderTitle(
  displayOption: BacklogDisplayOption,
  backlogOffset: number,
): string {
  if (displayOption === 'FOUR_DAYS') {
    return '';
  }
  if (displayOption === 'BIWEEKLY') {
    const { startDate, endDate } = computeStartAndEndDay(displayOption, backlogOffset);
    endDate.setDate(endDate.getDate() - 1);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
  if (displayOption === 'MONTHLY') {
    const d = new Date();
    d.setMonth(d.getMonth() + backlogOffset, 1);
    const month = d.getMonth();
    let monthString: string;
    switch (month) {
      case 0:
        monthString = 'January';
        break;
      case 1:
        monthString = 'February';
        break;
      case 2:
        monthString = 'March';
        break;
      case 3:
        monthString = 'April';
        break;
      case 4:
        monthString = 'May';
        break;
      case 5:
        monthString = 'June';
        break;
      case 6:
        monthString = 'July';
        break;
      case 7:
        monthString = 'August';
        break;
      case 8:
        monthString = 'September';
        break;
      case 9:
        monthString = 'October';
        break;
      case 10:
        monthString = 'November';
        break;
      case 11:
        monthString = 'December';
        break;
      default:
        throw new Error('Bad Month!');
    }
    return `${monthString} ${d.getFullYear()}`;
  }
  throw new Error('Bad display option!');
}

/**
 * Returns an array of backlog days given the current props and the display option.
 *
 * @param {DateToTaskMap} date2TaskMap the map from a date to all the tasks in that day.
 * @param {TagColorConfig} colors all the color config.
 * @param {BacklogDisplayOption} displayOption the display option.
 * @param {number} backlogOffset offset of displaying days.
 * @return {OneDayTask[]} an array of backlog days information.
 */
export function buildDaysInBacklog(
  date2TaskMap: DateToTaskMap, colors: TagColorConfig,
  displayOption: BacklogDisplayOption, backlogOffset: number,
): OneDayTask[] {
  const { startDate, endDate } = computeStartAndEndDay(displayOption, backlogOffset);
  const doesRenderSubTasks = displayOption !== 'MONTHLY';
  // Adding the days to array
  const days: OneDayTask[] = [];
  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasksOnThisDay = date2TaskMap.get(date.toLocaleDateString()) || [];
    const tasks = tasksOnThisDay.map((task: Task) => {
      const { tag } = task;
      return { ...task, color: colors[tag] };
    });
    days.push({ date, tasks, doesRenderSubTasks });
  }
  return days;
}
