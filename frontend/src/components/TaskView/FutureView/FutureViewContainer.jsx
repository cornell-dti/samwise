// @flow strict

import React from 'react';
import type { Node } from 'react';
import type {
  FutureViewContainerType,
  FutureViewDisplayOption,
  OneDayTask,
} from './future-view-types';
import type { State, Tag, Task } from '../../../store/store-types';
import { simpleConnect } from '../../../store/react-redux-util';
import { getColorByTagId } from '../../../util/tag-util';
import FutureViewNDays from './FutureViewNDays';
import FutureViewSevenColumns from './FutureViewSevenColumns';
import { filterCompletedTasks } from '../../../util/task-util';

type DateToTaskMap = Map<string, Task[]>;

type OwnProps = {|
  +nDays: number;
  +displayOption: FutureViewDisplayOption;
  +offset: number;
|}

type SubscribedProps = {|
  +days: OneDayTask[];
|};

type Props = {|
  ...OwnProps;
  ...SubscribedProps;
|};

/**
 * Compute a map from date to a list of tasks on that day for faster access.
 *
 * @param allTasks an array of all tasks. There is no assumption of the order of the tasks.
 * @return {DateToTaskMap} the built map.
 */
function buildDate2TaskMap(allTasks: Task[]): DateToTaskMap {
  const map: DateToTaskMap = new Map();
  allTasks.forEach((task) => {
    const dateString = new Date(task.date).toLocaleDateString();
    const tasksArrOpt = map.get(dateString);
    if (tasksArrOpt == null) {
      map.set(dateString, [task]);
    } else {
      tasksArrOpt.push(task);
    }
  });
  return map;
}

/**
 * Compute the start date and end date.
 *
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewContainerType} containerType the container type.
 * @param {number} offset offset of displaying days.
 * @return {{startDate: Date, endDate: Date}} the start date and end date.
 */
function computeStartAndEndDay(
  nDays: number, containerType: FutureViewContainerType, offset: number,
): {| +startDate: Date; endDate: Date |} {
  // Compute start date (the first date to display)
  const startDate = new Date();
  let hasAdditionalDays = false;
  switch (containerType) {
    case 'N_DAYS':
      startDate.setDate(startDate.getDate() + offset * nDays);
      break;
    case 'BIWEEKLY':
      startDate.setDate(startDate.getDate() - startDate.getDay() + offset * 14);
      break;
    case 'MONTHLY':
      startDate.setMonth(startDate.getMonth() + offset, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      hasAdditionalDays = startDate.getDate() !== 1;
      break;
    default:
  }
  // Compute end date (the first date not to display)
  let endDate = new Date(startDate); // the first day not to display.
  switch (containerType) {
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
 * Returns an array of backlog days given the current props and the display option.
 *
 * @param {Task[]} mainTaskArray the raw main task array.
 * @param {Tag[]} tags all the color config.
 * @param {number} nDays number of days in n-days view.
 * @param {FutureViewContainerType} containerType the container type.
 * @param {boolean} doesShowCompletedTasks whether to keep completed tasks.
 * @param {number} offset offset of displaying days.
 * @return {OneDayTask[]} an array of backlog days information.
 */
function buildDaysInBacklog(
  mainTaskArray: Task[], tags: Tag[], nDays: number,
  { containerType, doesShowCompletedTasks }: FutureViewDisplayOption, offset: number,
): OneDayTask[] {
  const date2TaskMap = buildDate2TaskMap(mainTaskArray);
  const { startDate, endDate } = computeStartAndEndDay(nDays, containerType, offset);
  // Adding the days to array
  const days: OneDayTask[] = [];
  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasksOnThisDay = date2TaskMap.get(date.toLocaleDateString()) || [];
    if (doesShowCompletedTasks) {
      const tasks = tasksOnThisDay.map((task: Task) => {
        const { tag } = task;
        return { original: task, filtered: task, color: getColorByTagId(tags, tag) };
      });
      days.push({ date, tasks });
    } else {
      const tasks = filterCompletedTasks(tasksOnThisDay).map(([original, filtered]) => {
        const { tag } = original;
        return { original, filtered, color: getColorByTagId(tags, tag) };
      });
      days.push({ date, tasks });
    }
  }
  return days;
}

function mapStateToProps({ mainTaskArray, tags }: State, ownProps: OwnProps): SubscribedProps {
  const { nDays, displayOption, offset } = ownProps;
  const days = buildDaysInBacklog(mainTaskArray, tags, nDays, displayOption, offset);
  return { days };
}

/**
 * The component used to contain all the backlog days.
 *
 * @param {Props} props all of the given props.
 * @return {Node} the rendered component.
 * @constructor
 */
function FutureViewContainer(props: Props): Node {
  const { nDays, displayOption: { containerType }, days } = props;
  const inNDaysView = containerType === 'N_DAYS';
  if (inNDaysView) {
    return <FutureViewNDays nDays={nDays} days={days} />;
  }
  return <FutureViewSevenColumns days={days} />;
}

const ConnectedFutureViewContainer = simpleConnect<OwnProps, SubscribedProps>(
  mapStateToProps,
)(FutureViewContainer);
export default ConnectedFutureViewContainer;
