import React, { ReactElement, KeyboardEvent } from 'react';
import { NONE_TAG } from 'common/util/tag-util';
import { SamwiseUserProfile } from 'common/types/store-types';
import SearchGroupMember from '../Util/GroupMemberListPicker/SearchGroupMember';
import styles from './Picker.module.scss';
import SamwiseIcon from '../UI/SamwiseIcon';

type OwnProps = {
  readonly member?: SamwiseUserProfile;
  readonly opened: boolean;
  readonly onMemberChange: (member: SamwiseUserProfile | undefined) => void;
  readonly onPickerOpened: () => void;
};
type Props = OwnProps & {
  readonly clearAssignedMember?: () => void;
  readonly groupMemberProfiles: SamwiseUserProfile[];
};

export default function GroupMemberPicker({
  member,
  opened,
  onMemberChange,
  onPickerOpened,
  clearAssignedMember,
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
    if (clearAssignedMember) clearAssignedMember();
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
        <span className={styles.TagDisplay}>{member ? member.name : 'assign to'}</span>
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
        tabIndex={-1}
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
