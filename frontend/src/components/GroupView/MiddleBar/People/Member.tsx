import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      <div className={styles.Plus}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      <SamwiseIcon className={styles.MemberIcon} iconName="bell" />
      <SamwiseIcon className={styles.MemberIcon} iconName="hug" />
    </div>
  );
};
