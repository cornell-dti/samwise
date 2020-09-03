import React, { ReactElement } from 'react';
import { Views } from './types';
import styles from './GroupIcon.module.scss';

type Props = {
  classCode: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined, e?: KeyboardEvent) => void;
  selected: boolean;
};

export default ({ classCode, handleClick, selected }: Props): ReactElement => (
  <button
    type="button"
    onClick={() => handleClick('group', classCode)}
    className={styles.GroupIcon + (selected ? ` ${styles.Active}` : '')}
  >
    {classCode.charAt(0)}
  </button>
);
