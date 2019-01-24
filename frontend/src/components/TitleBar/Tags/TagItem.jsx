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
 *
 * @param {Tag} tag the tag to render.
 * @param {function(Tag): EditTagAction} editTag the edit tag action.
 * @param {function(number): RemoveTagAction} removeTag the remove tag action.
 * @return {Node} the rendered node.
 * @constructor
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
  const { name, color, classId } = tag;
  const isClass = classId !== null;
  const nameNode = isClass
    ? <span className={styles.ClassExpandedTitle}>{name}</span>
    : <span className={styles.TagName} style={{ width: 'calc(100% - 150px)' }}>{name}</span>;
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
