// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { BacklogDisplayOption, OneDayTask } from './backlog-types';
import BacklogDay from './BacklogDay';
import type { State, Tag, Task } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';
import { buildDaysInBacklog } from './backlog-util';
import type { DateToTaskMap } from './backlog-util';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import styles from './BacklogDayContainer.css';

type OwnProps = {|
  +doesShowCompletedTasks: boolean;
  +displayOption: BacklogDisplayOption;
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

const mapStateToProps = ({ mainTaskArray, tags }: State): SubscribedProps => ({
  date2TaskMap: buildDate2TaskMap(mainTaskArray), tags,
});

/**
 * Render a component for one day in backlog.
 *
 * @param {OneDayTask} day the day object to display.
 * @param {boolean} inFourDaysView whether it's in four-days view
 * @param {boolean} doesShowCompletedTasks whether to show tasks that are completed.
 * @param {FloatingPosition} taskEditorPosition the position to put the task editor for a task.
 * @return {Node} the rendered component.
 */
const renderDay = (
  day: OneDayTask,
  inFourDaysView: boolean,
  doesShowCompletedTasks: boolean,
  taskEditorPosition: FloatingPosition,
): Node => (
  <Grid.Column
    key={day.date.toDateString()}
    className={inFourDaysView ? '' : styles.ColumnOtherViews}
  >
    <BacklogDay
      inFourDaysView={inFourDaysView}
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
function BacklogDaysContainer(props: Props): Node {
  const {
    date2TaskMap, tags, displayOption, backlogOffset, doesShowCompletedTasks,
  } = props;
  const inFourDaysView = displayOption === 'FOUR_DAYS';
  const days = buildDaysInBacklog(date2TaskMap, tags, displayOption, backlogOffset);
  const rows = [];
  const columns = days.length === 4 ? 4 : 7;
  const renderRow = (id, row) => (
    <Grid.Row
      key={id}
      className={inFourDaysView ? '' : styles.RowOtherViews}
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
    if (days.length === 4) {
      taskEditorPosition = i < 2 ? 'right' : 'left';
    } else {
      taskEditorPosition = i < 4 ? 'right' : 'left';
    }
    tempRow.push(renderDay(days[i], inFourDaysView, doesShowCompletedTasks, taskEditorPosition));
  }
  if (tempRow.length > 0) {
    rows.push(renderRow(rowId, tempRow));
  }
  if (!inFourDaysView) {
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
  return <Grid className={inFourDaysView ? '' : styles.GridOtherViews} stackable>{rows}</Grid>;
}

const ConnectedBacklogDaysContainer = simpleConnect<OwnProps, SubscribedProps>(
  mapStateToProps,
)(BacklogDaysContainer);
export default ConnectedBacklogDaysContainer;
