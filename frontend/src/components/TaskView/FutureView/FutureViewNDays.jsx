// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { OneDayTask } from './future-view-types';
import FutureViewDay from './FutureViewDay';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';

type Props = {|
  +nDays: number;
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
  <Grid.Column key={day.date.toDateString()}>
    <FutureViewDay
      inNDaysView
      doesShowCompletedTasks={doesShowCompletedTasks}
      taskEditorPosition={taskEditorPosition}
      {...day}
    />
  </Grid.Column>
);

/**
 * The component used to contain all the backlog days in n-days mode.
 *
 * @param {Props} props all of the given props.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function FutureViewNDays(props: Props): Node {
  const { nDays, days, doesShowCompletedTasks } = props;
  const columns = nDays;
  // Start adding items
  const rows = days.map((day: OneDayTask, index: number) => {
    const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
    return renderDay(day, doesShowCompletedTasks, taskEditorPosition);
  });
  return (
    <Grid stackable>
      <Grid.Row columns={columns}>{rows}</Grid.Row>
    </Grid>
  );
}
