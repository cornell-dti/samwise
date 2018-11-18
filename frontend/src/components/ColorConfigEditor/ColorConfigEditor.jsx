// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ClassColorConfigItemList from './ClassColorConfigItemList';
import TagColorConfigItemList from './TagColorConfigItemList';
import ColorConfigItemAdder from './ColorConfigItemAdder';
import styles from './ColorConfigEditor.css';

/**
 * The color config editor for settings.
 *
 * @return {Node} the rendered editor.
 * @constructor
 */
export default function ColorConfigEditor(): Node {
  return (
    <div>
      <ColorConfigItemAdder />
      <div>
        <p className={styles.classTags}>Class Tags</p>
        <ClassColorConfigItemList />
      </div>
      <div>
        <p className={styles.otherTags}>Other Tags</p>
        <TagColorConfigItemList />
      </div>
    </div>
  );
}
