import React, { ReactElement } from 'react';
import GroupTasksContainer from './GroupTasksContainer';
import styles from './index.module.css';
import memberStyles from '../../MiddleBar/People/Member.module.scss';

type Props = {
  memberName: string;
}

export default ({ memberName }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;

  return (
    <div className={styles.GroupTaskRow}>
      <div className={memberStyles.Initials}>{initials}</div>
      <GroupTasksContainer />
    </div>
  );
};
