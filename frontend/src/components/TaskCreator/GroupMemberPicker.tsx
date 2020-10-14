import React, { ReactElement, KeyboardEvent } from 'react';
import { NONE_TAG } from 'common/util/tag-util';
import { SamwiseUserProfile } from 'common/types/store-types';
import SearchGroupMember from '../Util/GroupMemberListPicker/SearchGroupMember';
import styles from './Picker.module.scss';
import SamwiseIcon from '../UI/SamwiseIcon';

type OwnProps = {
  readonly member: string;
  readonly opened: boolean;
  readonly onTagChange: (tag: string) => void;
  readonly onPickerOpened: () => void;
};
type Props = OwnProps & {
  readonly clearAssignedMember?: () => void;
  readonly groupMemberProfiles: SamwiseUserProfile[],
};

export default function GroupMemberPicker({
  member,
  opened,
  onTagChange,
  onPickerOpened,
  clearAssignedMember,
  groupMemberProfiles
}: Props): ReactElement {
  // Controllers
  const clickPicker = (): void => {
    onPickerOpened();
  };
  const pressedPicker = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') onPickerOpened();
  };
  const reset = (): void => {
    onTagChange('');
    if (clearAssignedMember) clearAssignedMember();
  }
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
          <span className={styles.TagDisplay}>{member}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>
            &times;
        </button>
        </>
      );
    return (
      <span
        role="presentation"
        onClick={clickPicker}
        onKeyPress={pressedPicker}
        className={styles.Label}
        style={style}
      >
        {internal}
      </span>
    );
  };
  return (
    <div className={styles.Main}>
      {displayedNode(member === '')}
      {opened && (
        <div>
          <SearchGroupMember
            members={groupMemberProfiles}
            onMemberChange={onTagChange}
          />
        </div>
      )}
    </div>
  );
}
