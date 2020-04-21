import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { promptConfirm, promptTextInput } from 'components/Util/Modals';
import Member from './Member';
import styles from './index.module.scss';

const leaveGroupPrompt = 'Are you sure you want to leave this group?';

function confirmLeaveGroup(): void {
  promptConfirm(leaveGroupPrompt).then(() => {
    console.log('Leave success');
  });
}

const promptAddMember = (): void => {
  promptTextInput(
    'Add a member by entering their email address:',
    'Add member',
    'text',
  ).then((input) => {
    console.log(input);
  });
};

type Props = {
  groupMemberNames: string[];
}

export default ({ groupMemberNames }: Props): ReactElement => (
  <div className={styles.People}>
    <h2>People</h2>
    {
      groupMemberNames.map((m) => <Member memberName={m} key={m} />)
    }
    <div className={styles.AddMember}>
      <div
        onClick={promptAddMember}
      >
        <FontAwesomeIcon icon={faPlus} />
      </div>
      Add member
    </div>
    <span
      role="presentation"
      className={styles.LeaveGroup}
      onClick={confirmLeaveGroup}
    >
      <SamwiseIcon iconName="exit" />
      <p>Leave Group</p>
    </span>
  </div>
);
