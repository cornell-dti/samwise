import React, { SyntheticEvent, ReactElement } from 'react';
import { Tag } from '../../../store/store-types';
import styles from './TagItem.module.css';
import ColorEditor from './ColorEditor';
import { editTag, removeTag } from '../../../firebase/actions';
import SamwiseIcon from '../../UI/SamwiseIcon';

type Props = { readonly tag: Tag };

/**
 * The tag item component.
 */
export default function TagItem({ tag }: Props): ReactElement {
  const onRemove = (): void => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Do you want to remove this tag?')) {
      removeTag(tag.id);
    }
  };
  const editColor = (color: string): void => {
    editTag({ ...tag, color });
  };
  const editName = (name: SyntheticEvent<HTMLInputElement>): void => {
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
      <button type="button" className={styles.DeleteTag} onClick={onRemove} tabIndex={0}>
        <SamwiseIcon iconName="x-light" />
      </button>
    </li>
  );
}
