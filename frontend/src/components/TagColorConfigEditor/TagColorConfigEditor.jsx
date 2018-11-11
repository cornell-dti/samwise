// @flow strict

import React from 'react';
import ClassColorConfigItemList from './ClassColorConfigItemList';
import TagColorConfigItemList from './TagColorConfigItemList';
import TagColorConfigItemAdder from './TagColorConfigItemAdder';
import styles from './TagColorConfigEditor.css';

export default function TagColorConfigEditor() {
  return (
    <div>
      <TagColorConfigItemAdder />
      <div><p className={styles.classTags}>Class Tags</p><ClassColorConfigItemList /></div>
      <div><p className={styles.otherTags}>Other Tags</p><TagColorConfigItemList /></div>
    </div>
  );
}
