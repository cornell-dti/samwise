// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import type { EditTagAction, RemoveTagAction } from '../../../store/action-types';
import { editTag as editTagAction, removeTag as removeTagAction } from '../../../store/actions';
import type { Tag } from '../../../store/store-types';
import styles from './TagItem.css';
import { dispatchConnect } from '../../../store/react-redux-util';
import ColorEditor from './ColorEditor';
import { disableBackend } from '../../../util/config';

type Props = {|
  +tag: Tag;
  +editTag: (tag: Tag) => EditTagAction;
  +removeTag: (tagId: number) => RemoveTagAction
|};

/**
 * The tag item component.
 */
function TagItem({ tag, editTag, removeTag }: Props): Node {
  const canBeEdited = disableBackend || tag.id >= 0;
  const onRemove = () => {
    // eslint-disable-next-line
    if (canBeEdited && confirm('Do you want to remove this tag?')) {
      removeTag(tag.id);
    }
  };
  const editColor = (color: string) => {
    if (canBeEdited) {
      editTag({ ...tag, color });
    }
  };
  const editName = (name: SyntheticInputEvent<HTMLInputElement>) => {
    if (canBeEdited) {
      editTag({ ...tag, name: name.currentTarget.value });
    }
  };
  const { name, color, classId } = tag;
  const isClass = classId !== null;
  const nameSplit = name.split(':');
  const nameNode = isClass
    ? <span style={{ width: 'calc(100% - 150px)', display: 'inline-block' }}><span className={styles.TagName}>{nameSplit[0]}</span><span className={styles.ClassExpandedTitle}>{nameSplit[1].trim()}</span></span>
    : <span className={styles.TagName} style={{ width: 'calc(100% - 150px)' }}><input type="text" value={name} onChange={editName} className={styles.TagEdit} /></span>;
  return (
    <li className={styles.ColorConfigItem}>
      {nameNode}
      <ColorEditor color={color} onChange={editColor} />
      <button type="button" className={styles.DeleteTag} onClick={onRemove}>
        <Icon name="close" />
      </button>
    </li>
  );
}

const actionCreators = { editTag: editTagAction, removeTag: removeTagAction };
const Connected = dispatchConnect<Props, typeof actionCreators>(actionCreators)(TagItem);
export default Connected;
