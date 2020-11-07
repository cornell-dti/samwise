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

const sendNotification = (variant: string): void => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderName: 'jason',
      recipientName: 'other jason',
      recipientEmail: 'jasontungnyc@gmail.com',
      variant: 'heart',
    }),
  };

  fetch('https://us-central1-samwise-dev.cloudfunctions.net/TestHTTPRequests', requestOptions)
    .then((response) => response.json())
    .then((data) => console.log(data));
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
