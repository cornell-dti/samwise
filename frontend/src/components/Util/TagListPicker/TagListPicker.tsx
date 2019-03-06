// @flow strict

import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import TagPickerItem from './TagPickerItem';
import styles from './TagListPicker.css';
import { State, Tag } from '../../../store/store-types';
import { NONE_TAG_ID } from '../../../util/tag-util';
import { getOrderedTags } from '../../../store/selectors';

type OwnProps = { readonly onTagChange: (newTag: string) => void };
type Props = OwnProps & { readonly tags: Tag[] };

/**
 * The component used to pick a tag from a list.
 *
 * @param {function} onTagChange the function to call when tag changed.
 * @param {Tag[]} tags a list of all tags. Given by the redux store.
 * @return {Node} the rendered picker.
 * @constructor
 */
function TagListPicker({ onTagChange, tags }: Props): ReactElement {
  const items = tags.slice().sort((a, b) => {
    if (a.id === NONE_TAG_ID) { return -1; }
    if (b.id === NONE_TAG_ID) { return 1; }
    if (a.classId != null && b.classId == null) { return -1; }
    if (a.classId == null && b.classId != null) { return 1; }
    return a.name.localeCompare(b.name);
  }).map(({ id, name, color }: Tag) => (
    <TagPickerItem key={id} id={id} title={name} color={color} onChange={onTagChange} />
  ));
  return (
    <ul className={styles.NewTaskClass}>
      {items}
    </ul>
  );
}

const Connected = connect((state: State) => ({ tags: getOrderedTags(state) }))(TagListPicker);
export default Connected;
