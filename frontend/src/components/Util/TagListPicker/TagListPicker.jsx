// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import TagPickerItem from './TagPickerItem';
import styles from './TagListPicker.css';
import type { Tag } from '../../../store/store-types';
import { tagsConnect } from '../../../util/tag-util';

type OwnProps = {| +onTagChange: (number) => void |};
type SubscribedProps = {| +tags: Tag[]; |};
type Props = {| ...OwnProps; ...SubscribedProps; |};

/**
 * The component used to pick a tag from a list.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {Tag[]} tags a list of all tags. Given by the redux store.
 * @return {Node} the rendered picker.
 * @constructor
 */
function TagListPicker({ onTagChange, tags }: Props): Node {
  const handleClassChange = (e) => {
    const newTag = parseInt(e.currentTarget.getAttribute('data-id') || -1, 10);
    onTagChange(newTag);
  };
  const items = tags.slice().sort((a, b) => {
    if (a.id === -1) { return -1; }
    if (b.id === -1) { return 1; }
    if (a.classId != null && b.classId == null) { return -1; }
    if (a.classId == null && b.classId != null) { return 1; }
    return a.name.localeCompare(b.name);
  }).map(({ id, name, color }: Tag) => (
    <TagPickerItem key={id} id={id} title={name} color={color} onChange={handleClassChange} />
  ));
  return (
    <ul className={styles.NewTaskClass}>
      {items}
    </ul>
  );
}

const ConnectedTagListPicker = tagsConnect<Props>(TagListPicker);
export default ConnectedTagListPicker;
