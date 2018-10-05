// @flow

import * as React from 'react';
import BacklogTask from './BacklogTask';
import styles from './BacklogDay.css';
import type { OneDayTask } from './types';

export default function BacklogDay({ date, tasks }: OneDayTask) {
  let dayString: string;
  switch (date.getDay()) {
    case 0:
      dayString = 'SUN';
      break;
    case 1:
      dayString = 'MON';
      break;
    case 2:
      dayString = 'TUE';
      break;
    case 3:
      dayString = 'WED';
      break;
    case 4:
      dayString = 'THU';
      break;
    case 5:
      dayString = 'FRI';
      break;
    case 6:
      dayString = 'SAT';
      break;
    default:
      throw new Error('Impossible Case');
  }
  return (
    <div className={styles.BacklogDay}>
      <div>{dayString}</div>
      <div>{date.getDate()}</div>
      <div>
        {tasks.map(t => <BacklogTask name={t.name} color={t.color} />)}
      </div>
    </div>
  );
}
