// @flow

import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';
import styles from './BacklogTask.css';
import type { SimpleTask } from './types';

export default function BacklogTask({ name, color, completed }: SimpleTask) {
  return (
    <div className={styles.BacklogTask} style={{ backgroundColor: color }}>
      <Checkbox checked={completed} />
      <span
        className={styles.BacklogTaskText}
        style={completed ? { textDecoration: 'line-through' } : {}}
      >
        {name}
      </span>
    </div>
  );
}
