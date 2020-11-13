import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import firebase from 'firebase/app';
import SamwiseIcon from '../../UI/SamwiseIcon';
import styles from './GroupViewMiddleBarMemberRow.module.scss';
import ProfileImage from './ProfileImage';

type Props = {
  memberName: string;
  profilePicURL: string;
  group: string;
  email: string;
};

const sendNotification = (variant: string, email: string, group: string): void => {
  const msg = {
    data: {
      groupId: group,
      recipientEmail: email,
      variant,
    },
  };
  const sendMessage = firebase.functions().httpsCallable('sendNotificationEmail');
  sendMessage(msg);
};

const Member = ({ memberName, profilePicURL, group, email }: Props): ReactElement => {
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
      <SamwiseIcon
        className={styles.MemberIcon}
        iconName="bell-outline"
        onClick={() => sendNotification('bell', email, group)}
      />
      <SamwiseIcon
        className={styles.MemberIcon}
        iconName="hug"
        onClick={() => sendNotification('hug', email, group)}
      />
    </div>
  );
};

export default Member;
