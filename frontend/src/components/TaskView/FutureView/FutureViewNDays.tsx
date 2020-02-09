import React, { ReactElement } from 'react';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.module.css';
import { SimpleDate } from './future-view-types';

type IdOrder = { readonly id: string; readonly order: number };

type Props = {
  readonly days: readonly SimpleDate[];
  readonly doesShowCompletedTasks: boolean;
};

/**
 * The component used to contain all the backlog days in n-days mode.
 */
function FutureViewNDays(
  { days, doesShowCompletedTasks }: Props,
): ReactElement {
  const nDays = days.length;
  const containerStyle = { gridTemplateColumns: `repeat(${nDays}, minmax(0, 1fr))` };

  return (
    <div className={styles.FutureViewNDays} style={containerStyle}>
      {days.map((date: SimpleDate, index: number) => {
        const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
        return (
          <div key={date.text} className={styles.Column}>
            <FutureViewDay
              inNDaysView
              calendarPosition="bottom"
              taskEditorPosition={taskEditorPosition}
              doesShowCompletedTasks={doesShowCompletedTasks}
              date={date}
            />
          </div>
        );
      })}
    </div>
  );
}

export default FutureViewNDays;
