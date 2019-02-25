// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import TagIcon from '../../assets/svgs/tag.svg';
import TagListPicker from '../Util/TagListPicker/TagListPicker';
import styles from './Picker.css';
import { NONE_TAG, NONE_TAG_ID } from '../../util/tag-util';
import type { State, Tag } from '../../store/store-types';

type OwnProps = {|
  +tag: string;
  +opened: boolean;
  +onTagChange: (tag: string) => void;
  +onPickerOpened: () => void;
|};
type Props = {|
  ...OwnProps;
  // subscribed from redux store.
  +getTag: (id: string) => Tag;
|};

function TagPicker(
  {
    tag, opened, onTagChange, onPickerOpened, getTag,
  }: Props,
): Node {
  // Controllers
  const clickPicker = () => { onPickerOpened(); };
  const reset = () => onTagChange(NONE_TAG_ID);
  // Nodes
  const displayedNode = (isDefault: boolean) => {
    const { name, color, classId } = getTag(tag);
    const style = isDefault ? {} : { background: color };
    const internal = isDefault
      ? (<TagIcon />)
      : (
        <React.Fragment>
          <span className={styles.TagDisplay}>{classId != null ? name.split(':')[0] : name}</span>
          <button type="button" className={styles.ResetButton} onClick={reset}>&times;</button>
        </React.Fragment>
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

const Connected: ComponentType<OwnProps> = connect(
  ({ tags }: State) => ({ getTag: id => tags.get(id) ?? NONE_TAG }),
)(TagPicker);
export default Connected;
