// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import { isNull } from 'util';
import TagPickerItem from './TagPickerItem';
import styles from './TagListPicker.css';
import type { State, Tag } from '../../../store/store-types';
import { NONE_TAG_ID } from '../../../util/tag-util';
import { getOrderedTags } from '../../../store/selectors';

type OwnProps = {| +onTagChange: (string) => void |};
type Props = {| ...OwnProps; +tags: Tag[]; |};

/**
 * The component used to pick a tag from a list.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {Tag[]} tags a list of all tags. Given by the redux store.
 * @return {Node} the rendered picker.
 * @constructor
 */
function TagListPicker({ onTagChange, tags }: Props): Node {
  const items = tags.slice().sort((a, b) => {
    if (a.id === NONE_TAG_ID) { return 1; }
    if (b.id === NONE_TAG_ID) { return -1; }
    if (a.classId != null && b.classId == null) { return -1; }
    if (a.classId == null && b.classId != null) { return 1; }
    return a.name.localeCompare(b.name);
  }).map(({ id, name, color, classId }: Tag) => (
    <TagPickerItem key={id} id={id} title={classId !== isNull ? name.split(':')[0] : name} color={color} onChange={onTagChange} />
  ));
  return (
    <ul className={styles.NewTaskClass}>
      {items}
    </ul>
  );
}

const Connected: ComponentType<OwnProps> = connect(
  (state: State) => ({ tags: getOrderedTags(state) }),
)(TagListPicker);
export default Connected;