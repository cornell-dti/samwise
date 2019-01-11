// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import TagItem from '../Tags/TagItem';
import ClassTagAdder from '../Tags/ClassTagAdder';
import OtherTagAdder from '../Tags/OtherTagAdder';
import styles from './SettingsPage.css';
import type { Tag } from '../../../store/store-types';
import { firebaseSignOut } from '../../../util/firebase-util';
import { tagsConnect } from '../../../util/tag-util';

/**
 * The class adder component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
const ClassAdder = (): Node => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>Add Classes</p>
    <div className={styles.SettingsSectionContent}>
      <ClassTagAdder />
      <small>Add classes to get upcoming prelims automatically added to your planner.</small>
    </div>
  </div>
);

/**
 * The exam exporter component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
const ExamImporter = (): Node => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>Auto Import Exams</p>
    <div className={`${styles.SettingsButton} ${styles.SettingsSectionContent}`}>
      Click the following button to automatically import the prelims and finals
      from your registered classes into your planner.
      <br />
      <button type="button">Import</button>
    </div>
  </div>
);

/**
 * The sign out component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
const SignOut = (): Node => (
  <div className={styles.SettingsSection}>
    <div className={styles.SettingsButton}>
      <button type="button" className={styles.SignButton} onClick={firebaseSignOut}>
        Sign Out
      </button>
    </div>
  </div>
);

/**
 * The tags container component.
 *
 * @param {string} title the title of the tags.
 * @param {Node} children the tags as children.
 * @return {Node} rendered component.
 * @constructor
 */
const TagsContainer = ({ title, children }: {| +title: string; +children: Node |}): Node => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>{title}</p>
    <div className={styles.SettingsSectionContent}>
      <ul className={styles.ColorConfigItemList}>
        {children}
      </ul>
    </div>
  </div>
);

type Props = {| +tags: Tag[]; |};

/**
 * The settings page.
 *
 * @param {Tag[]} tags all the tags.
 * @return {Node} the rendered editor.
 * @constructor
 */
function SettingsPage({ tags }: Props): Node {
  const classTags: Tag[] = [];
  const otherTags: Tag[] = [];
  tags.forEach((tag) => {
    if (tag.type === 'class') {
      classTags.push(tag);
    } else if (tag.name !== 'None') {
      otherTags.push(tag);
    }
  });
  const renderTags = (arr: Tag[]): Node => arr.map((tag: Tag) => (
    <TagItem key={tag.id} tag={tag} />
  ));
  return (
    <div>
      <ClassAdder />
      <TagsContainer title="Class Tags">
        {renderTags(classTags)}
      </TagsContainer>
      <ExamImporter />
      <TagsContainer title="Other Tags">
        {renderTags(otherTags)}
        <OtherTagAdder />
      </TagsContainer>
      <SignOut />
    </div>
  );
}

const Connected = tagsConnect<Props>(SettingsPage);
export default Connected;
