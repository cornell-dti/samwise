import React, { ReactElement } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Group, SamwiseUserProfile, State } from 'common/types/store-types';
import { useSelector } from 'react-redux';
import SamwiseIcon from '../../UI/SamwiseIcon';
import { promptConfirm, promptTextInput } from '../../Util/Modals';
import GroupViewMiddleBarMemberRow from './GroupViewMiddleBarMemberRow';
import styles from './GroupViewMiddleBarPeopleList.module.scss';
import { leaveGroup } from '../../../firebase/actions';

const leaveGroupPrompt = 'Are you sure you want to leave this group?';

async function confirmLeaveGroup(
  groupID: string,
  changeViewCallback: (selectedGroup: string | undefined) => void,
  groups: Group[]
): Promise<void> {
  const confirmed = await promptConfirm(leaveGroupPrompt);
  if (confirmed) {
    await leaveGroup(groupID);
    const updatedGroups = groups.filter(({ id }) => id !== groupID).map(({ id }) => id);
    changeViewCallback(updatedGroups[0]);
  }
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

type Props = {
  readonly group: Group;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
  readonly changeView: (selectedGroup: string | undefined) => void;
};

const People = ({ group, groupMemberProfiles, changeView }: Props): ReactElement => {
  const groups = useSelector((state: State) => Array.from(state.groups.values()));
  return (
    <div className={styles.People}>
      <h2>People</h2>
      <div className={styles.MemberList}>
        {groupMemberProfiles.map(({ name, email, photoURL }) => (
          <GroupViewMiddleBarMemberRow
            group={group.id}
            memberName={name}
            key={email}
            email={email}
            profilePicURL={photoURL}
          />
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
      <button
        type="button"
        className={styles.LeaveGroup}
        onClick={() => confirmLeaveGroup(group.id, changeView, groups)}
      >
        <SamwiseIcon iconName="exit" />
        <p>Leave Group</p>
      </button>
    </div>
  );
};

export default People;
