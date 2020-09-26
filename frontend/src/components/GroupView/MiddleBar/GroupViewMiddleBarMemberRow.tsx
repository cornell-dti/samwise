import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SamwiseIcon from '../../UI/SamwiseIcon';
import styles from './GroupViewMiddleBarMemberRow.module.scss';

type Props = {
  memberName: string;
};

const Member = ({ memberName }: Props): ReactElement => {
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

export default Member;
