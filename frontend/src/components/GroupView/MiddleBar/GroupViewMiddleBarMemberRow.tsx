import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import firebase from 'firebase/app';
import SamwiseIcon from '../../UI/SamwiseIcon';
import styles from './GroupViewMiddleBarMemberRow.module.scss';
import ProfileImage from './ProfileImage';
import { useTaskCreatorContextSetter } from '../../TaskCreator';

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
  const setTaskCreatorContext = useTaskCreatorContextSetter();

  const openTaskCreator = (): void =>
    setTaskCreatorContext({
      taskCreatorOpened: true,
      assignedMembers: [{ email, name: memberName, photoURL: profilePicURL }],
    });

  return (
    <div className={styles.Member}>
      <ProfileImage
        className={styles.MemberProfilePic}
        memberName={memberName}
        imageURL={profilePicURL}
      />
      <p>{memberName}</p>
      <div>
        <div className={styles.Plus}>
          <FontAwesomeIcon icon={faPlus} onClick={openTaskCreator} />
        </div>
        <SamwiseIcon
          className={styles.MemberIcon}
          iconName="bell-outline"
          onClick={() => sendNotification('reminder', email, group)}
        />
        <SamwiseIcon
          className={styles.MemberIcon}
          iconName="hug"
          onClick={() => sendNotification('hug', email, group)}
        />
      </div>
    </div>
  );
};

export default Member;
