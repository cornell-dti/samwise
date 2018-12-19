// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { FutureViewDisplayOption, OneDayTask } from './future-view-types';
import FutureViewDay from './FutureViewDay';
import type { State, Tag, Task } from '../../../store/store-types';
import { simpleConnect } from '../../../store/react-redux-util';
import { buildDaysInBacklog } from './future-view-util';
import type { DateToTaskMap } from './future-view-util';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewDayContainer.css';

type OwnProps = {|
  +nDays: number;
  +doesShowCompletedTasks: boolean;
  +displayOption: FutureViewDisplayOption;
  +backlogOffset: number;
|}

type SubscribedProps = {|
  +date2TaskMap: DateToTaskMap;
  +tags: Tag[];
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
 * Render a component for one day in backlog.
 *
 * @param {OneDayTask} day the day object to display.
 * @param {boolean} inNDaysView whether it's in n-days view
 * @param {boolean} doesShowCompletedTasks whether to show tasks that are completed.
 * @param {FloatingPosition} taskEditorPosition the position to put the task editor for a task.
 * @return {Node} the rendered component.
 */
const renderDay = (
  day: OneDayTask,
  inNDaysView: boolean,
  doesShowCompletedTasks: boolean,
  taskEditorPosition: FloatingPosition,
): Node => (
  <Grid.Column
    key={day.date.toDateString()}
    className={inNDaysView ? '' : styles.ColumnOtherViews}
  >
    <FutureViewDay
      inNDaysView={inNDaysView}
      doesShowCompletedTasks={doesShowCompletedTasks}
      taskEditorPosition={taskEditorPosition}
      {...day}
    />
  </Grid.Column>
);

/**
 * The component used to contain all the backlog days.
 *
 * @param {Props} props all of the given props.
 * @return {Node} the rendered component.
 * @constructor
 */
function FutureViewDaysContainer(props: Props): Node {
  const {
    date2TaskMap, tags, nDays, displayOption, backlogOffset, doesShowCompletedTasks,
  } = props;
  const inNDaysView = displayOption === 'N_DAYS';
  const days = buildDaysInBacklog(date2TaskMap, tags, nDays, displayOption, backlogOffset);
  const rows = [];
  const columns = days.length === nDays ? nDays : 7;
  const renderRow = (id, row) => (
    <Grid.Row
      key={id}
      className={inNDaysView ? '' : styles.RowOtherViews}
      columns={columns}
    >
      {row}
    </Grid.Row>
  );
  // Start adding rows
  let tempRow = [];
  let rowId = 0;
  for (let i = 0; i < days.length; i += 1) {
    if (tempRow.length === 7) {
      rows.push(renderRow(rowId, tempRow));
      rowId += 1;
      tempRow = [];
    }
    let taskEditorPosition: FloatingPosition;
    if (days.length === nDays) {
      taskEditorPosition = i < (nDays / 2) ? 'right' : 'left';
    } else {
      taskEditorPosition = i < 4 ? 'right' : 'left';
    }
    tempRow.push(renderDay(days[i], inNDaysView, doesShowCompletedTasks, taskEditorPosition));
  }
  if (tempRow.length > 0) {
    rows.push(renderRow(rowId, tempRow));
  }
  if (!inNDaysView) {
    // Add weekday bar
    rows.unshift((
      <Grid.Row key="grid-weekdays-row" columns={7}>
        <Grid.Column className={styles.ColumnInWeekdayRow}>SUN</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>MON</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>TUE</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>WED</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>THU</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>FRI</Grid.Column>
        <Grid.Column className={styles.ColumnInWeekdayRow}>SAT</Grid.Column>
      </Grid.Row>
    ));
  }
  return <Grid className={inNDaysView ? '' : styles.GridOtherViews} stackable>{rows}</Grid>;
}

const ConnectedFutureViewDaysContainer = simpleConnect<OwnProps, SubscribedProps>(
  ({ mainTaskArray, tags }: State): SubscribedProps => ({
    date2TaskMap: buildDate2TaskMap(mainTaskArray), tags,
  }),
)(FutureViewDaysContainer);
export default ConnectedFutureViewDaysContainer;
