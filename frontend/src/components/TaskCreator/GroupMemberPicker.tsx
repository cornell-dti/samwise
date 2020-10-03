import React, { ReactElement, KeyboardEvent } from "react";
import { connect } from "react-redux";
import { NONE_TAG, NONE_TAG_ID } from "common/util/tag-util";
import { State, Tag, GroupMember } from "common/types/store-types";
import SearchGroupMember from "../Util/GroupMemberListPicker/SearchGroupMember";
import styles from "./Picker.module.scss";
import SamwiseIcon from "../UI/SamwiseIcon";

type OwnProps = {
  readonly tag: string;
  readonly opened: boolean;
  readonly onTagChange: (tag: string) => void;
  readonly onPickerOpened: () => void;
};
type Props = OwnProps & {
  // subscribed from redux store.
  readonly getTag: (id: string) => Tag;
};

// hardcoded member list
const members: GroupMember[] = [
  { netId: "dl123", name: "Darien Lopez" },
  { netId: "sj234", name: "Sarah Johnson" },
  { netId: "mp678", name: "Michelle Parker" },
  { netId: "sj99", name: "Sarah Jo" },
];

function GroupMemberPicker({
  tag,
  opened,
  onTagChange,
  onPickerOpened,
  getTag,
}: Props): ReactElement {
  // Controllers
  const clickPicker = (): void => {
    onPickerOpened();
  };
  const pressedPicker = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") onPickerOpened();
  };
  const reset = (): void => onTagChange(NONE_TAG_ID);
  // Nodes
  const displayedNode = (isDefault: boolean): ReactElement => {
    const { name, color, classId } = getTag(tag);
    const style = isDefault
      ? { background: NONE_TAG.color }
      : { background: color };
    const internal = isDefault
      ? (
        <>
          <span className={styles.TagDisplay}>
            <SamwiseIcon iconName="user-plus" className={styles.CenterIcon} />
            &nbsp;assign to&nbsp;&nbsp;
          </span>
        </>
      )
      : (
        <>
          <span className={styles.TagDisplay}>
            {classId != null ? name.split(":")[0] : name}
          </span>
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
      {displayedNode(tag === NONE_TAG_ID)}
      {opened && (
        // <div className={styles.NewTaskClassPick}>
        <div>
          <SearchGroupMember members={members} />
        </div>
      )}
    </div>
  );
}

const Connected = connect(({ tags }: State) => ({
  getTag: (id: string) => tags.get(id) ?? NONE_TAG,
}))(GroupMemberPicker);
export default Connected;
