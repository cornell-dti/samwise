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

      <div className={styles.SettingsSection}>
        <p>Add Classes</p>
        <div>
          <ColorConfigItemAdder />
          <small>Add classes to get upcoming prelims automatically added to your planner</small>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p>Class Tags</p>
        <div>
          <ClassColorConfigItemList />
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p>Auto Import Exams</p>
        <div className={styles.ImportBtn}>
          Click the following button to automatically import the prelims and finals
          from your registered classes into your calendar.
          <br />
          <button type="button">Import</button>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p className={styles.otherTags}>Other Tags</p>
        <div>
          <TagColorConfigItemList />
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <div className={styles.ImportBtn} style={{ paddingTop: '15px' }}>
          <button type="button" className={styles.SignBtn}>Sign Out</button>
        </div>
      </div>

    </div>
  );
}
