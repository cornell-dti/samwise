// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Grid } from 'semantic-ui-react';
import type { BacklogDisplayOption, OneDayTask } from './backlog-types';
import BacklogDay from './BacklogDay';
import type { State, TagColorConfig, Task } from '../../store/store-types';
import styles from './Backlog.css';

type Props = {| +date2TaskMap: Map<string, Task[]>; +colors: TagColorConfig; |};

type ComponentState = {| displayOption: BacklogDisplayOption |};

/**
 * Compute a map from date to a list of tasks on that day for faster access.
 *
 * @param allTasks an array of all tasks. There is no assumption of the order of the tasks.
 * @return {Map<string, Task[]>} the built map.
 */
function buildDate2TaskMap(allTasks: Task[]): Map<string, Task[]> {
  const map: Map<string, Task[]> = new Map();
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
 * Returns an array of backlog days given the current props and the display option.
 *
 * @param date2TaskMap the map from date to tasks.
 * @param colors all the color config.
 * @param displayOption decides how much days to display.
 * @return {OneDayTask[]} an array of backlog days information.
 */
function buildDaysInBacklog(
  { date2TaskMap, colors }: Props,
  { displayOption }: ComponentState,
): OneDayTask[] {
  // Compute start date (the first date to display)
  const startDate = new Date();
  if (displayOption !== 'FOUR_DAYS') {
    // only four days view start at today. Otherwise it should start at Sunday.
    startDate.setDate(startDate.getDate() - startDate.getDay());
  }

  // Compute end date (the first date not to display)
  const endDisplayDate = new Date(startDate); // the first day not to display.
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
  endDisplayDate.setDate(endDisplayDate.getDate() + offset);

  // Adding the days to array
  const days: OneDayTask[] = [];
  for (let d = startDate; d < endDisplayDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const tasksOnThisDay = date2TaskMap.get(date.toLocaleDateString()) || [];
    const tasks = tasksOnThisDay.map((task: Task) => {
      const { tag } = task;
      return { ...task, color: colors[tag] };
    });
    days.push({ date, tasks });
  }
  return days;
}

const mapStateToProps = (state: State): Props => {
  const { mainTaskArray, tagColorPicker } = state;
  return { date2TaskMap: buildDate2TaskMap(mainTaskArray), colors: tagColorPicker };
};

class Backlog extends React.Component<Props, ComponentState> {
  constructor(props) {
    super(props);
    this.state = { displayOption: 'FOUR_DAYS' };
  }

  renderDay = (day: OneDayTask) => (
    <Grid.Column key={day.date.toDateString()}>
      <BacklogDay {...day} />
    </Grid.Column>
  );

  renderRows() {
    const days = buildDaysInBacklog(this.props, this.state);
    const rows = [];
    let tempRow = [];
    let rowId = 0;
    const renderRow = (id: number, row: any) => (
      <Grid.Row columns={7} key={id}>{row}</Grid.Row>
    );
    for (let i = 0; i < days.length; i += 1) {
      if (tempRow.length === 7) {
        rows.push(renderRow(rowId, tempRow));
        rowId += 1;
        tempRow = [];
      }
      tempRow.push(this.renderDay(days[i]));
    }
    if (tempRow.length > 0) {
      rows.push(renderRow(rowId, tempRow));
    }
    return rows;
  }

  render() {
    return (
      <div>
        <div className={styles.BacklogControl}>
          <span className={styles.BacklogControlPadding} />
          <Button.Group>
            <Button onClick={() => this.setState({ displayOption: 'FOUR_DAYS' })}>4D</Button>
            <Button.Or />
            <Button onClick={() => this.setState({ displayOption: 'BIWEEKLY' })}>2W</Button>
            <Button.Or />
            <Button onClick={() => this.setState({ displayOption: 'MONTHLY' })}>M</Button>
          </Button.Group>
        </div>
        <Grid>{this.renderRows()}</Grid>
      </div>
    );
  }
}

const ConnectedBackLog = connect(
  mapStateToProps,
  null,
)(Backlog);
export default ConnectedBackLog;
