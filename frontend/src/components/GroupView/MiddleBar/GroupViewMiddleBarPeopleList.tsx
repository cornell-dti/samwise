import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SamwiseUserProfile } from 'common/types/store-types';
import SamwiseIcon from '../../UI/SamwiseIcon';
import { promptConfirm, promptTextInput } from '../../Util/Modals';
import GroupViewMiddleBarMemberRow from './GroupViewMiddleBarMemberRow';
import styles from './GroupViewMiddleBarPeopleList.module.scss';

const leaveGroupPrompt = 'Are you sure you want to leave this group?';

function confirmLeaveGroup(): void {
  promptConfirm(leaveGroupPrompt).then(() => {
    console.log('Leave success');
  });
}

const promptAddMember = (): void => {
  promptTextInput(
    'Add new member',
    'Send them an invitation through email',
    'NetID:',
    'Send',
    'text'
  ).then((input) => {
    console.log(input);
  });
};

type Props = { readonly groupMemberProfiles: readonly SamwiseUserProfile[] };

const People = ({ groupMemberProfiles }: Props): ReactElement => (
  <div className={styles.People}>
    <h2>People</h2>
    <div className={styles.MemberList}>
      {groupMemberProfiles.map((profile) => (
        <GroupViewMiddleBarMemberRow memberName={profile.name} key={profile.email} />
      ))}
    </div>
    <button
      type="button"
      onClick={promptAddMember}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && promptAddMember()}
      className={styles.AddMember}
    >
      <div>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      Add member
    </button>
    <button type="button" className={styles.LeaveGroup} onClick={confirmLeaveGroup}>
      <SamwiseIcon iconName="exit" />
      <p>Leave Group</p>
    </button>
  </div>
);

export default People;
