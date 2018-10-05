// @flow

import * as React from 'react';
import styles from './BacklogTask.css';

type Props = {| name: string, color: string |};

export default function BacklogTask({ name, color }: Props) {
  return (
    <div className={styles.BackLogTask} style={{ backgroundColor: color }}>{name}</div>
  );
}
