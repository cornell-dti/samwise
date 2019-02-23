// @flow strict

import React from 'react';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.css';

type Props = {| +days: Date[]; +doesShowCompletedTasks: boolean; |};

/**
 * The component used to contain all the backlog days in n-days mode.
 */
export default function FutureViewNDays({ days, doesShowCompletedTasks }: Props) {
  const nDays = days.length;
  const containerStyle = { gridTemplateColumns: `${100.0 / nDays}% `.repeat(nDays).trim() };
  return (
    <div className={styles.FutureViewNDays} style={containerStyle}>
      {days.map((date: Date, index: number) => {
        const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
        return (
          <div key={date.getTime()} className={styles.Column}>
            <FutureViewDay
              inNDaysView
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
