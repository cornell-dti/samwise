// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { OneDayTask } from './future-view-types';
import FutureViewDay from './FutureViewDay';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewSevenColumns.css';

type Props = {|
  +days: OneDayTask[];
  +doesShowCompletedTasks: boolean;
|};

/**
 * Render a component for one day in backlog.
 *
 * @param {OneDayTask} day the day object to display.
 * @param {boolean} doesShowCompletedTasks whether to show tasks that are completed.
 * @param {FloatingPosition} taskEditorPosition the position to put the task editor for a task.
 * @return {Node} the rendered component.
 */
const renderDay = (
  day: OneDayTask,
  doesShowCompletedTasks: boolean,
  taskEditorPosition: FloatingPosition,
): Node => (
  <Grid.Column key={day.date.toDateString()} className={styles.ColumnOfDay}>
    <FutureViewDay
      inNDaysView={false}
      doesShowCompletedTasks={doesShowCompletedTasks}
      taskEditorPosition={taskEditorPosition}
      {...day}
    />
  </Grid.Column>
);

/**
 * The component used to contain all the backlog days in 7 columns..
 *
 * @param {Props} props all of the given props.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function FutureViewSevenColumns(props: Props): Node {
  const { days, doesShowCompletedTasks } = props;
  const rows = [];
  const renderRow = (id, row) => (
    <Grid.Row key={id} className={styles.Row} columns={7}>{row}</Grid.Row>
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
    const taskEditorPosition: FloatingPosition = (i % 7) < 4 ? 'right' : 'left';
    tempRow.push(renderDay(days[i], doesShowCompletedTasks, taskEditorPosition));
  }
  if (tempRow.length > 0) {
    rows.push(renderRow(rowId, tempRow));
  }
  // Add weekday bar
  rows.unshift((
    <Grid.Row key="grid-weekdays-row" columns={7}>
      <Grid.Column className={styles.ColumnOfDayTitle}>SUN</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>MON</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>TUE</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>WED</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>THU</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>FRI</Grid.Column>
      <Grid.Column className={styles.ColumnOfDayTitle}>SAT</Grid.Column>
    </Grid.Row>
  ));
  return <Grid className={styles.Grid} stackable>{rows}</Grid>;
}
