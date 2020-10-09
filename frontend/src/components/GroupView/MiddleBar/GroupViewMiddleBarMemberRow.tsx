import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SamwiseIcon from '../../UI/SamwiseIcon';
import styles from './GroupViewMiddleBarMemberRow.module.scss';
import ProfileImage from './ProfileImage';

type Props = {
  memberName: string;
  profilePicURL: string;
};

const Member = ({ memberName, profilePicURL }: Props): ReactElement => {
  return (
    <div className={styles.Member}>
      <ProfileImage
        className={styles.MemberProfilePic}
        memberName={memberName}
        imageURL={profilePicURL}
      />
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
