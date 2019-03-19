import React, { ReactElement } from 'react';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewSevenColumns.css';
import { SimpleDate } from './future-view-types';

type Props = { readonly days: SimpleDate[]; readonly doesShowCompletedTasks: boolean };

/**
 * The component used to contain all the backlog days in 7 columns.
 */
export default ({ days, doesShowCompletedTasks }: Props): ReactElement => {
  const interval = (days.length === 14) ? '2W':'Monthly';
  // Start building items
  const items = days.map((date: SimpleDate, i: number) => (
    <FutureViewDay
      key={date.text}
      inNDaysView={false}
      taskEditorPosition={(i % 7) < 4 ? 'right' : 'left'}
      calendarPosition={ ((interval === '2W' && i / 7 < 2) || (interval === 'Monthly' && i / 7 < 3)) ? 'top':'bottom' }
      doesShowCompletedTasks={doesShowCompletedTasks}
      date={date}
    />
  ));
  let styleString = '';
  const numRows = Math.ceil(items.length / 7);
  const templateStyleString = ` minmax(0, ${1 / numRows}fr)`;
  for (let i = 0; i < numRows; i += 1) {
    styleString += templateStyleString;
  }
  const gridStyle = { gridTemplateRows: styleString.trim() };
  return (
    <div className={styles.FutureViewSevenColumns} style={gridStyle}>
      {items}
    </div>
  );
};
