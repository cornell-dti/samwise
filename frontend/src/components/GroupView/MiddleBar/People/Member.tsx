import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import styles from './Member.module.scss';

type Props = {
  memberName: string;
}

export default ({ memberName }: Props): ReactElement => {
  const initials = `${memberName.split(' ')[0].charAt(0)}${memberName.split(' ')[1].charAt(0)}`;
  return (
    <div className={styles.Member}>
      <div className={styles.Initials}>{initials}</div>
      <p>{memberName}</p>
      <SamwiseIcon className={styles.MemberIcon} iconName="poke" />
      <SamwiseIcon className={styles.MemberIcon} iconName="hug" />
    </div>
  );
};
