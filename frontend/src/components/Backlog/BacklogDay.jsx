// @flow

import * as React from 'react';
import BacklogTask from './BacklogTask';
import styles from './BacklogDay.css';
import type { OneDayTask } from './types';

export default function BacklogDay({ date, tasks }: OneDayTask) {
  const dayString = (() => {
    switch (date.getDay()) {
      case 0:
        return 'SUN';
      case 1:
        return 'MON';
      case 2:
        return 'TUE';
      case 3:
        return 'WED';
      case 4:
        return 'THU';
      case 5:
        return 'FRI';
      case 6:
        return 'SAT';
      default:
        throw new Error('Impossible Case');
    }
  })();
  return (
    <div className={styles.BacklogDay}>
      <div>{dayString}</div>
      <div>{date.getDate()}</div>
      <div>
        {tasks.map(t => <BacklogTask key={t.id} {...t} />)}
      </div>
    </div>
  );
}
