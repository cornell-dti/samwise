// @flow strict

import React from 'react';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewSevenColumns.css';

type Props = {| +days: Date[]; +doesShowCompletedTasks: boolean; |};

/**
 * The component used to contain all the backlog days in 7 columns.
 */
export default function FutureViewSevenColumns({ days, doesShowCompletedTasks }: Props) {
  // Start building items
  const items = days.map((date: Date, i: number) => (
    <FutureViewDay
      key={date.getTime()}
      inNDaysView={false}
      taskEditorPosition={(i % 7) < 4 ? 'right' : 'left'}
      doesShowCompletedTasks={doesShowCompletedTasks}
      date={date}
    />
  ));
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
