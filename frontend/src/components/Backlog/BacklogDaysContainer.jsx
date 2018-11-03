// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { BacklogDisplayOption, OneDayTask } from './backlog-types';
import BacklogDay from './BacklogDay';
import type { State, TagColorConfig, Task } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';

type DateToTaskMap = Map<string, Task[]>;

type OwnProps = {| displayOption: BacklogDisplayOption; |}

type SubscribedProps = {|
  +date2TaskMap: DateToTaskMap;
  +colors: TagColorConfig;
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

const mapStateToProps = (state: State): SubscribedProps => ({
  date2TaskMap: buildDate2TaskMap(state.mainTaskArray),
  colors: state.tagColorPicker,
});

/**
 * Compute the start date and end date.
 *
 * @param {BacklogDisplayOption} displayOption the display option of the backlog days container.
 * @return {{startDate: Date, endDate: Date}} the start date and end date.
 */
function computeStartAndEndDay(
  displayOption: BacklogDisplayOption,
): {| +startDate: Date; endDate: Date |} {
  // Compute start date (the first date to display)
  const startDate = new Date();
  switch (displayOption) {
    case 'BIWEEKLY':
      startDate.setDate(startDate.getDate() - startDate.getDay());
      break;
    case 'MONTHLY':
      startDate.setDate(1);
      break;
    default:
  }
  // Compute end date (the first date not to display)
  const endDate = new Date(startDate); // the first day not to display.
  let offset: number;
  switch (displayOption) {
    case 'FOUR_DAYS':
      offset = 4;
      break;
    case 'BIWEEKLY':
      offset = 14;
      break;
    case 'MONTHLY':
      offset = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      break;
    default:
      throw new Error('Impossible Case');
  }
  endDate.setDate(endDate.getDate() + offset);
  return { startDate, endDate };
}

/**
 * Returns an array of backlog days given the current props and the display option.
 *
 * @param {DateToTaskMap} date2TaskMap the map from a date to all the tasks in that day.
 * @param {TagColorConfig} colors all the color config.
 * @param {BacklogDisplayOption} displayOption the display option.
 * @return {OneDayTask[]} an array of backlog days information.
 */
function buildDaysInBacklog(
  date2TaskMap: DateToTaskMap, colors: TagColorConfig, displayOption: BacklogDisplayOption,
): OneDayTask[] {
  const { startDate, endDate } = computeStartAndEndDay(displayOption);
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

/**
 * Render a component for one day in backlog.
 *
 * @param day the day object to display.
 * @return {Node} the rendered component.
 */
const renderDay = (day: OneDayTask): Node => (
  <Grid.Column key={day.date.toDateString()}>
    <BacklogDay {...day} />
  </Grid.Column>
);

/**
 * The component used to contain all the backlog days.
 *
 * @param date2TaskMap the map from a date to all the tasks in that day.
 * @param colors all the color config.
 * @param displayOption the display option.
 * @return {Node} the rendered component.
 * @constructor
 */
function BacklogDaysContainer({ date2TaskMap, colors, displayOption }: Props): Node {
  const days = buildDaysInBacklog(date2TaskMap, colors, displayOption);
  const rows = [];
  const columns = days.length === 4 ? 4 : 7;
  const renderRow = (id, row) => (<Grid.Row columns={columns} key={id}>{row}</Grid.Row>);
  // Start adding rows
  let tempRow = [];
  let rowId = 0;
  for (let i = 0; i < days.length; i += 1) {
    if (tempRow.length === 7) {
      rows.push(renderRow(rowId, tempRow));
      rowId += 1;
      tempRow = [];
    }
    tempRow.push(renderDay(days[i]));
  }
  if (tempRow.length > 0) {
    rows.push(renderRow(rowId, tempRow));
  }
  return <Grid>{rows}</Grid>;
}

const ConnectedBacklogDaysContainer = simpleConnect<Props, OwnProps, SubscribedProps>(
  mapStateToProps,
)(BacklogDaysContainer);
export default ConnectedBacklogDaysContainer;
