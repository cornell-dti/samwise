// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import { Grid } from 'semantic-ui-react';
import type { BacklogDisplayOption, OneDayTask } from './backlog-types';
import BacklogDay from './BacklogDay';
import type { State, TagColorConfig, Task } from '../../store/store-types';
import { simpleConnect } from '../../store/react-redux-util';
import { buildDaysInBacklog } from './backlog-util';
import type { DateToTaskMap } from './backlog-util';
import type { FloatingPosition } from '../FloatingTaskEditor/floating-task-editor-types';

type OwnProps = {|
  +doesShowCompletedTasks: boolean;
  +displayOption: BacklogDisplayOption;
  +backlogOffset: number;
|}

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
 * Render a component for one day in backlog.
 *
 * @param {OneDayTask} day the day object to display.
 * @param {boolean} doesShowCompletedTasks whether to show tasks that are completed.
 * @param {FloatingPosition} taskEditorPosition the position to put the task editor for a task.
 * @return {Node} the rendered component.
 */
const renderDay = (
  day: OneDayTask, doesShowCompletedTasks: boolean, taskEditorPosition: FloatingPosition,
): Node => (
  <Grid.Column key={day.date.toDateString()}>
    <BacklogDay
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
    date2TaskMap, colors, displayOption, backlogOffset, doesShowCompletedTasks,
  } = props;
  const days = buildDaysInBacklog(date2TaskMap, colors, displayOption, backlogOffset);
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
    let taskEditorPosition: FloatingPosition;
    if (days.length === 4) {
      if (i < 2) {
        taskEditorPosition = 'right';
      } else if (i === 2) {
        taskEditorPosition = 'below';
      } else {
        taskEditorPosition = 'left';
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (i < 5) {
        taskEditorPosition = 'right';
      } else if (i === 5) {
        taskEditorPosition = 'below';
      } else {
        taskEditorPosition = 'left';
      }
    }
    tempRow.push(renderDay(days[i], doesShowCompletedTasks, taskEditorPosition));
  }
  if (tempRow.length > 0) {
    rows.push(renderRow(rowId, tempRow));
  }
  return <Grid stackable>{rows}</Grid>;
}

const ConnectedBacklogDaysContainer = simpleConnect<Props, OwnProps, SubscribedProps>(
  mapStateToProps,
)(BacklogDaysContainer);
export default ConnectedBacklogDaysContainer;
