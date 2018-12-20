// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import ColorConfigItemAdder from './ColorConfigItemAdder';
import styles from './ColorConfigEditor.css';
import ColorConfigItem from './ColorConfigItem';
import AddNormalTag from './AddNormalTag';
import { simpleConnect } from '../../../store/react-redux-util';
import type { State, Tag } from '../../../store/store-types';

type Props = {|
  tags: Tag[];
|};

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
    } else {
      otherTags.push(tag);
    }
  });
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
          <ul className={styles.ColorConfigItemList}>
            {classTags.map(tag => (<ColorConfigItem key={tag.id} tag={tag} />))}
          </ul>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p>Auto Import Exams</p>
        <div className={styles.ImportBtn}>
          Click the following button to automatically import the prelims and finals
          from your registered classes into your planner.
          <br />
          <button type="button">Import</button>
        </div>
      </div>
      <div className={styles.SettingsSection}>
        <p className={styles.otherTags}>Other Tags</p>
        <div>
          <ul className={styles.ColorConfigItemList}>
            {otherTags.filter(tag => tag.name !== 'None').map(
              tag => (<ColorConfigItem key={tag.id} tag={tag} />),
            )}
            <AddNormalTag />
          </ul>
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

const ConnectedColorConfigEditor = simpleConnect<{||}, Props>(
  ({ tags }: State) => ({ tags }),
)(ColorConfigEditor);
export default ConnectedColorConfigEditor;
