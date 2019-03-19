import React, { ReactElement } from 'react';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.css';
import { SimpleDate } from './future-view-types';
import {CalendarPosition} from "../../Util/TaskEditors/editors-types";

type Props = {
  readonly days: SimpleDate[];
  readonly doesShowCompletedTasks: boolean;
  readonly calendarPosition: CalendarPosition;
};

/**
 * The component used to contain all the backlog days in n-days mode.
 */
export default function FutureViewNDays({ days, doesShowCompletedTasks, calendarPosition }: Props): ReactElement {
  const nDays = days.length;
  const containerStyle = { gridTemplateColumns: `${100.0 / nDays}% `.repeat(nDays).trim() };
  return (
    <div className={styles.FutureViewNDays} style={containerStyle}>
      {days.map((date: SimpleDate, index: number) => {
        const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
        return (
          <div key={date.text} className={styles.Column}>
            <FutureViewDay
              inNDaysView
              taskEditorPosition={taskEditorPosition}
              doesShowCompletedTasks={doesShowCompletedTasks}
              calendarPosition={calendarPosition}
              date={date}
            />
          </div>
        );
      })}
    </div>
  );
}
