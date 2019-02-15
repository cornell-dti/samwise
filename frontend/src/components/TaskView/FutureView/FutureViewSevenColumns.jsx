// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { OneDayTask } from './future-view-types';
import FutureViewDay from './FutureViewDay';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import styles from './FutureViewSevenColumns.css';

type Props = {|
  +days: OneDayTask[];
|};

/**
 * The component used to contain all the backlog days in 7 columns..
 *
 * @param {OneDayTask[]} days all the days.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function FutureViewSevenColumns({ days }: Props): Node {
  // Start building items
  const items = days.map((day: OneDayTask, i: number) => {
    const taskEditorPosition: FloatingPosition = (i % 7) < 4 ? 'right' : 'left';
    return (
      <FutureViewDay
        key={day.date.getTime()}
        inNDaysView={false}
        taskEditorPosition={taskEditorPosition}
        {...day}
      />
    );
  });
  let styleString = '40px';
  const numRows = Math.ceil(items.length / 7);
  const templateStyleString = ` minmax(0, ${1 / numRows}fr)`;
  for (let i = 0; i < numRows; i += 1) {
    styleString += templateStyleString;
  }
  const gridStyle = { gridTemplateRows: styleString };
  const weeklyBar = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    .map(s => <div key={s} className={styles.HeaderWeekday}>{s}</div>);
  return (
    <div className={styles.FutureViewSevenColumns} style={gridStyle}>
      {weeklyBar}
      {items}
    </div>
  );
}
