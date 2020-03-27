import React, { ReactElement } from 'react';
import styles from './GroupIcon.module.scss';

type Props = {
  group: string;
}

export default ({ group }: Props): ReactElement => (
  <span className={styles.GroupIcon}>
    {group}
  </span>
);
