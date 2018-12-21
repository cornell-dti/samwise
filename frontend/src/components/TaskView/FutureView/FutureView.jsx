// @flow strict

import React from 'react';
import type { Node } from 'react';
import FutureViewControl from './FutureViewControl';
import FutureViewNDays from './FutureViewNDays';
import FutureViewSevenColumns from './FutureViewSevenColumns';
import type {
  FutureViewContainerType,
  FutureViewDisplayOption,
  OneDayTask,
} from './future-view-types';
import type { WindowSize } from '../../Util/Responsive/window-size-context';
import type { Tag, Task } from '../../../store/store-types';
import { getTagConnect } from '../../../util/tag-util';
import { filterCompletedTasks } from '../../../util/task-util';

export opaque type FutureViewConfig = {|
  +displayOption: FutureViewDisplayOption;
  +offset: number;
|};
type Props = {|
  +windowSize: WindowSize;
  +config: FutureViewConfig;
  +tasks: Task[];
  +onConfigChange: (FutureViewConfig) => void;
  // subscribed from redux store.
  +getTag: (id: number) => Tag;
|};

export type FutureViewConfigProvider = {|
  +initialValue: FutureViewConfig;
  +isInNDaysView: (FutureViewConfig) => boolean;
|};
export const futureViewConfigProvider: FutureViewConfigProvider = {
  initialValue: {
    displayOption: {
      containerType: 'N_DAYS',
      doesShowCompletedTasks: true,
    },
    offset: 0,
  },
  isInNDaysView: (config: FutureViewConfig) => config.displayOption.containerType === 'N_DAYS',
};

type DateToTaskMap = Map<string, Task[]>;

/**
 * Compute a map from date to a list of tasks on that day for faster access.
 *
 * @param {Task[]} tasks an array of all tasks. There is no assumption of the order of the tasks.
 * @return {DateToTaskMap} the built map.
 */
function buildDate2TaskMap(tasks: Task[]): DateToTaskMap {
  const map: DateToTaskMap = new Map();
  tasks.forEach((task) => {
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
 * Returns an array of future view days given the current props and the display option.
 *
 * @param {number} nDays number of days in n-days view.
 * @param {DateToTaskMap} date2TaskMap the built date to tasks map.
 * @param {FutureViewConfig} config the display config.
 * @param {function(number): Tag} getTag the function used to get tags from id.
 * @return {OneDayTask[]} an array of backlog days information.
 */
function buildDaysInFutureView(
  nDays: number, date2TaskMap: DateToTaskMap, config: FutureViewConfig,
  getTag: (number) => Tag,
): OneDayTask[] {
  const { displayOption: { containerType, doesShowCompletedTasks }, offset } = config;
  const { startDate, endDate } = computeStartAndEndDay(nDays, containerType, offset);
  // Adding the days to array
  const days: OneDayTask[] = [];
  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasksOnThisDay = date2TaskMap.get(date.toLocaleDateString()) || [];
    const compoundTasks = doesShowCompletedTasks
      ? tasksOnThisDay.map((task: Task) => ({
        original: task,
        filtered: task,
        color: getTag(task.tag).color,
      }))
      : filterCompletedTasks(tasksOnThisDay).map(([original, filtered]) => ({
        original,
        filtered,
        color: getTag(original.tag).color,
      }));
    days.push({ date, tasks: compoundTasks });
  }
  return days;
}

class FutureView extends React.PureComponent<Props> {
  /**
   * Compute the number of days in n-days mode.
   *
   * @return {number} the number of days in n-days mode.
   */
  nDays = (): number => {
    const { windowSize: { width } } = this.props;
    if (width > 960) { return 5; }
    if (width > 768) { return 4; }
    if (width > 500) { return 2; }
    return 1;
  };

  /**
   * Changes the state when the future view controller changes.
   *
   * @param {$Shape<State>} change the partial change.
   */
  controlOnChange = (change: $Shape<FutureViewConfig>) => {
    const { config, onConfigChange } = this.props;
    onConfigChange({ ...config, ...change });
  };

  render(): Node {
    const {
      windowSize, config, tasks, getTag,
    } = this.props;
    const nDays = this.nDays();
    const days = buildDaysInFutureView(nDays, buildDate2TaskMap(tasks), config, getTag);
    const { displayOption, offset } = config;
    const inNDaysView = displayOption.containerType === 'N_DAYS';
    const daysContainer = inNDaysView
      ? <FutureViewNDays nDays={nDays} days={days} />
      : <FutureViewSevenColumns days={days} />;
    return (
      <div>
        <FutureViewControl
          windowSize={windowSize}
          nDays={nDays}
          displayOption={displayOption}
          offset={offset}
          onChange={this.controlOnChange}
        />
        {daysContainer}
      </div>
    );
  }
}

const ConnectedFutureView = getTagConnect<Props>(FutureView);
export default ConnectedFutureView;
