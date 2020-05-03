import React, { ReactElement } from 'react';
import { Views } from './types';
import styles from './GroupIcon.module.scss';

type Props = {
  groupName: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined) => void;
}

export default ({ groupName, handleClick }: Props): ReactElement => (
  <button
    type="button"
    onClick={() => handleClick('group', groupName)}
    className={styles.GroupIcon}
  >
    {groupName}
  </button>
);
