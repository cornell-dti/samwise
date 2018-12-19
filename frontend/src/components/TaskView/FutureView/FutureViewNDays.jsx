// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { OneDayTask } from './future-view-types';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.css';

type Props = {|
  +nDays: number;
  +days: OneDayTask[];
  +doesShowCompletedTasks: boolean;
|};

/**
 * The component used to contain all the backlog days in n-days mode.
 *
 * @param {Props} props all of the given props.
 * @return {Node} the rendered component.
 * @constructor
 */
export default function FutureViewNDays(props: Props): Node {
  const { nDays, days, doesShowCompletedTasks } = props;
  const containerStyle = { gridTemplateColumns: `${100.0 / nDays}% `.repeat(nDays).trim() };
  return (
    <div className={styles.FutureViewNDays} style={containerStyle}>
      {days.map((day: OneDayTask, index: number) => {
        const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
        return (
          <div key={day.date.getTime()} className={styles.Column}>
            <FutureViewDay
              inNDaysView
              doesShowCompletedTasks={doesShowCompletedTasks}
              taskEditorPosition={taskEditorPosition}
              {...day}
            />
          </div>
        );
      })}
    </div>
  );
}
