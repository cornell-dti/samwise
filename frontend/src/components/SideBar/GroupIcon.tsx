import React, { ReactElement, KeyboardEvent } from 'react';
import { Views } from './types';
import styles from './GroupIcon.module.scss';

type Props = {
  classCode: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined, e?: KeyboardEvent) => void;
  selected: boolean;
}

export default ({ classCode, handleClick, selected }: Props): ReactElement => (
  <div
    role="presentation"
    onClick={() => handleClick('group', classCode)}
    onKeyPress={(e) => handleClick('group', classCode, e)}
    className={styles.GroupIcon + (selected ? ` ${styles.Active}` : '')}
  >
    {classCode.charAt(0)}
  </div>
);
