// @flow strict

import React from 'react';
import type { Node } from 'react';
import Delete from '../../../assets/svgs/X.svg';
import type { Tag } from '../../../store/store-types';
import styles from './TagItem.css';
import ColorEditor from './ColorEditor';
import { editTag, removeTag } from '../../../firebase/actions';

type Props = {| +tag: Tag; |};

/**
 * The tag item component.
 */
export default function TagItem({ tag }: Props): Node {
  const onRemove = () => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Do you want to remove this tag?')) {
      removeTag(tag.id);
    }
  };
  const editColor = (color: string) => {
    editTag({ ...tag, color });
  };
  const editName = (name: SyntheticInputEvent<HTMLInputElement>) => {
    editTag({ ...tag, name: name.currentTarget.value });
  };
  const { name, color, classId } = tag;
  const isClass = classId !== null;
  const nameSplit = name.split(':');
  const nameNode = isClass
    ? (
      <span style={{ width: 'calc(100% - 175px)', display: 'inline-block' }}>
        <span className={styles.TagName}>{nameSplit[0]}</span>
        <span className={styles.ClassExpandedTitle}>{nameSplit[1].trim()}</span>
      </span>
    ) : (
      <span className={styles.TagName} style={{ width: 'calc(100% - 175px)' }}>
        <input type="text" value={name} onChange={editName} className={styles.TagEdit} />
      </span>
    );
  return (
    <li className={styles.ColorConfigItem}>
      {nameNode}
      <ColorEditor color={color} onChange={editColor} />
      <button type="button" className={styles.DeleteTag} onClick={onRemove}>
        <span style={{ backgroundImage: `url(${Delete})` }} />
      </button>
    </li>
  );
}
