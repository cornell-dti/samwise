import React, { ReactElement, KeyboardEvent } from 'react';
import { NONE_TAG } from 'common/util/tag-util';
import { SamwiseUserProfile } from 'common/types/store-types';
import SearchGroupMember from '../Util/GroupMemberListPicker/SearchGroupMember';
import styles from './Picker.module.scss';
import SamwiseIcon from '../UI/SamwiseIcon';

type OwnProps = {
  readonly member?: readonly SamwiseUserProfile[]; // list of members to assign
  readonly opened: boolean;
  readonly onMemberChange: (member: readonly SamwiseUserProfile[] | undefined) => void;
  readonly onPickerOpened: () => void;
};
type Props = OwnProps & {
  readonly clearAssignedMembers?: () => void;
  readonly groupMemberProfiles: readonly SamwiseUserProfile[];
};

export default function GroupMemberPicker({
  member,
  opened,
  onMemberChange,
  onPickerOpened,
  clearAssignedMembers,
  groupMemberProfiles,
}: Props): ReactElement {
  // Controllers
  const clickPicker = (): void => {
    onPickerOpened();
  };
  const pressedPicker = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') onPickerOpened();
  };
  const reset = (): void => {
    onMemberChange(undefined);
    if (clearAssignedMembers) clearAssignedMembers();
  };
  const getMemberNames = (selectedMembers: readonly SamwiseUserProfile[]): string => {
    let memberNames = '';
    let i = 0;
    while (memberNames.length < 12 && i < selectedMembers.length) {
      const firstName = selectedMembers[i].name.split(' ')[0];
      if (memberNames.length + firstName.length < 12) {
        if (i !== 0) {
          memberNames += ', ';
        }
        memberNames += firstName;
        i += 1;
      } else {
        break;
      }
    }
    const remainingMemberCount = selectedMembers.length - i;
    if (remainingMemberCount > 0) memberNames += ` +${remainingMemberCount}`;

    return memberNames;
  };

  // Nodes
  const displayedNode = (isDefault: boolean): ReactElement => {
    const style = { background: NONE_TAG.color };
    const internal = isDefault ? (
      <>
        <span className={styles.TagDisplay}>
          <SamwiseIcon iconName="user-plus" className={styles.CenterIcon} />
          &nbsp;assign to&nbsp;&nbsp;
        </span>
      </>
    ) : (
      <>
        <span className={styles.TagDisplay}>{member ? getMemberNames(member) : 'assign to'}</span>
        <button type="button" className={styles.ResetButton} onClick={reset}>
          &times;
        </button>
      </>
    );
    return (
      <button
        type="button"
        onClick={clickPicker}
        onKeyPress={pressedPicker}
        className={`${styles.TagButton} ${styles.Label}`}
        style={style}
      >
        {internal}
      </button>
    );
  };
  return (
    <div className={styles.Main}>
      {displayedNode(member === undefined)}
      {opened && (
        <div>
          <SearchGroupMember members={groupMemberProfiles} onMemberChange={onMemberChange} />
        </div>
      )}
    </div>
  );
}
