import React, { ReactElement, KeyboardEvent } from 'react';
import { Views, Group } from './types';
import styles from './GroupIcon.module.scss';

type Props = {
  groupName: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined) => void;
  pressedIcon: (e: KeyboardEvent, selectedView: Views, selectedGroup: Group) => void;
}

export default ({ groupName, handleClick, pressedIcon }: Props): ReactElement => (
  <span
    role="presentation"
    onClick={() => handleClick('group', groupName)}
    onKeyPress={(e) => pressedIcon(e, 'group', groupName)}
    className={styles.GroupIcon}
  >
    {groupName}
  </span>
);
