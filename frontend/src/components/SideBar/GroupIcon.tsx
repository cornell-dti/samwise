import React, { ReactElement, KeyboardEvent } from 'react';
import { Views, Group } from './types';
import styles from './GroupIcon.module.scss';

type Props = {
  classCode: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined) => void;
  pressedIcon: (e: KeyboardEvent, selectedView: Views, selectedGroup: Group) => void;
}

export default ({ classCode, handleClick, pressedIcon }: Props): ReactElement => (
  <span
    role="presentation"
    onClick={() => handleClick('group', classCode)}
    onKeyPress={(e) => pressedIcon(e, 'group', classCode)}
    className={styles.GroupIcon}
  >
    {classCode.charAt(0)}
  </span>
);
