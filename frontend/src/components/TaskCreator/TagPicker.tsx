import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import TagListPicker from '../Util/TagListPicker/TagListPicker';
import styles from './Picker.module.css';
import { NONE_TAG, NONE_TAG_ID } from '../../util/tag-util';
import { State, Tag } from '../../store/store-types';
import SamwiseIcon from '../UI/SamwiseIcon';

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

function TagPicker({ tag, opened, onTagChange, onPickerOpened, getTag }: Props): ReactElement {
  // Controllers
  const clickPicker = (): void => { onPickerOpened(); };
  const reset = (): void => onTagChange(NONE_TAG_ID);
  // Nodes
  const displayedNode = (isDefault: boolean): ReactElement => {
    const { name, color, classId } = getTag(tag);
    const style = isDefault ? {} : { background: color };
    const internal = isDefault
      ? <SamwiseIcon iconName="tag" className={styles.CenterIcon} />
      : (
        <>
          <span className={styles.TagDisplay}>{classId != null ? name.split(':')[0] : name}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </>
      );
    return (
      <span role="presentation" onClick={clickPicker} className={styles.Label} style={style}>
        {internal}
      </span>
    );
  };
  return (
    <div className={styles.Main}>
      {displayedNode(tag === NONE_TAG_ID)}
      {opened && (
        <div className={styles.NewTaskClassPick}>
          <TagListPicker onTagChange={onTagChange} />
        </div>
      )}
    </div>
  );
}

const Connected = connect(
  ({ tags }: State) => ({ getTag: (id: string) => tags.get(id) ?? NONE_TAG }),
)(TagPicker);
export default Connected;
