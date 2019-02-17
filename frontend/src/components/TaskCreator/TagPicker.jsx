// @flow strict

import React from 'react';
import type { Node } from 'react';
import tagIcon from '../../assets/svgs/tag.svg';
import TagListPicker from '../Util/TagListPicker/TagListPicker';
import styles from './Picker.css';
import { getTagConnect, NONE_TAG_ID } from '../../util/tag-util';
import type { Tag } from '../../store/store-types';

type Props = {|
  +tag: string;
  +opened: boolean;
  +onTagChange: (tag: string) => void;
  +onPickerOpened: () => void;
  // subscribed from redux store.
  +getTag: (id: string) => Tag;
|};

function TagPicker(props: Props): Node {
  const {
    tag, opened, onTagChange, onPickerOpened, getTag,
  } = props;
  // Controllers
  const clickPicker = () => { onPickerOpened(); };
  const reset = () => onTagChange(NONE_TAG_ID);
  // Nodes
  const displayedNode = (isDefault: boolean) => {
    const { name, color, classId } = getTag(tag);
    const style = isDefault ? {} : { background: color };
    const internal = isDefault
      ? (<tagIcon className={styles.CenterIcon} />)
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

const ConnectedTagPicker = getTagConnect<Props>(TagPicker);
export default ConnectedTagPicker;
