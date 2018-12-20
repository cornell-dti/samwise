// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ColorConfigItemAdder from './ColorConfigItemAdder';
import styles from './ColorConfigEditor.css';
import ColorConfigItem from './ColorConfigItem';
import OtherTagAdder from './OtherTagAdder';
import { simpleConnect } from '../../../store/react-redux-util';
import type { State, Tag } from '../../../store/store-types';

type Props = {| +tags: Tag[]; |};

/**
 * The color config editor for settings.
 *
 * @param {Tag[]} tags all the tags.
 * @return {Node} the rendered editor.
 * @constructor
 */
function ColorConfigEditor({ tags }: Props): Node {
  const classTags = [];
  const otherTags = [];
  tags.forEach((tag) => {
    if (tag.type === 'class') {
      classTags.push(tag);
    } else if (tag.name !== 'None') {
      otherTags.push(tag);
    }
  });
  const renderTags = (arr: Tag[]) => arr.map(tag => (
    <ColorConfigItem key={tag.id} tag={tag} />
  ));
  return (
    <div>
      <div className={styles.SettingsSection}>
        <p className={styles.SettingsSectionTitle}>Add Classes</p>
        <div className={styles.SettingsSectionContent}>
          <ColorConfigItemAdder />
          <small>Add classes to get upcoming prelims automatically added to your planner.</small>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p className={styles.SettingsSectionTitle}>Class Tags</p>
        <div className={styles.SettingsSectionContent}>
          <ul className={styles.ColorConfigItemList}>
            {renderTags(classTags)}
          </ul>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p className={styles.SettingsSectionTitle}>Auto Import Exams</p>
        <div className={`${styles.SettingsButton} ${styles.SettingsSectionContent}`}>
          Click the following button to automatically import the prelims and finals
          from your registered classes into your planner.
          <br />
          <button type="button">Import</button>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p className={styles.SettingsSectionTitle}>Other Tags</p>
        <div className={styles.SettingsSectionContent}>
          <ul className={styles.ColorConfigItemList}>
            {renderTags(otherTags)}
            <OtherTagAdder />
          </ul>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <div className={styles.SettingsButton} style={{ paddingTop: '15px' }}>
          <button type="button" className={styles.SignButton}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

const ConnectedColorConfigEditor = simpleConnect<{||}, Props>(
  ({ tags }: State) => ({ tags }),
)(ColorConfigEditor);
export default ConnectedColorConfigEditor;
