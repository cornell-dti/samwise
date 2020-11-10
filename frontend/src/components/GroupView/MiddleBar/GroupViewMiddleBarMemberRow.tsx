import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import firebase from 'firebase';
import SamwiseIcon from '../../UI/SamwiseIcon';
import styles from './GroupViewMiddleBarMemberRow.module.scss';
import ProfileImage from './ProfileImage';

type Props = {
  memberName: string;
  profilePicURL: string;
};

const sendNotification = (variant: string): void => {
  const msg = {
    data: {
      groupId: '',
      recipientEmail: '',
    },
  };
  const sendMessage = firebase.functions().httpsCallable('sendNotificationEmail');
  sendMessage(msg)
    .then(() => {
      console.log('lets goo');
    })
    .catch((e) => console.log(e));
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
      <SamwiseIcon
        className={styles.MemberIcon}
        iconName="bell-outline"
        onClick={() => sendNotification('bell')}
      />
      <SamwiseIcon
        className={styles.MemberIcon}
        iconName="hug"
        onClick={() => sendNotification('hug')}
      />
    </div>
  );
};

export default Member;
