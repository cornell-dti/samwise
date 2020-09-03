import React, { ReactElement, ReactNode } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Tag, State } from 'common/lib/types/store-types';
import TagItem from '../Tags/TagItem';
import ClassTagAdder from '../Tags/ClassTagAdder';
import OtherTagAdder from '../Tags/OtherTagAdder';
import styles from './SettingsPage.module.css';
import { completeOnboarding, importCourseExams } from '../../../firebase/actions';
import { firebaseSignOut } from '../../../firebase/auth-util';
import CanvasCalendar from '../Canvas/CanvasCalendar';

/**
 * The class adder component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
export const ClassAdder = (): ReactElement => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>Add Classes</p>
    <div className={styles.SettingsSectionContent}>
      <ClassTagAdder />
      <small>Add classes to get upcoming prelims automatically added to your planner.</small>
    </div>
  </div>
);

export const ExamImporter = (): ReactElement => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>Auto Import Exams</p>
    <div className={`${styles.SettingsButton} ${styles.SettingsSectionContent}`}>
      Click the following button to reimport the prelims and finals from your classes into your
      planner. We will only import those that appears on Cornell prelim/final schedule webpage.
      <br />
      <button type="button" title="Reimport Exams" onClick={importCourseExams} tabIndex={0}>
        Reimport Exams
      </button>
    </div>
  </div>
);

type TagsContainerProps = { readonly title: string; readonly children: ReactNode };

/**
 * The tags container component.
 *
 * @param {string} title the title of the tags.
 * @param {Node} children the tags as children.
 * @return {Node} rendered component.
 * @constructor
 */
export const TagsContainer = ({ title, children }: TagsContainerProps): ReactElement => (
  <div className={styles.SettingsSection}>
    <p className={styles.SettingsSectionTitle}>{title}</p>
    <div className={styles.SettingsSectionContent}>
      <ul className={styles.ColorConfigItemList}>{children}</ul>
    </div>
  </div>
);

type Props = {
  readonly tags: Map<string, Tag>;
};

/**
 * The settings page.
 */
export function SettingsPage({ tags }: Props): ReactElement {
  const classTags: Tag[] = [];
  const otherTags: Tag[] = [];
  tags.forEach((tag) => {
    if (tag.classId !== null) {
      classTags.push(tag);
    } else if (tag.name !== 'None') {
      otherTags.push(tag);
    }
  });
  const renderTags = (arr: Tag[]): ReactNode =>
    arr.map((tag: Tag) => <TagItem key={tag.id} tag={tag} />);

  return (
    <div>
      <ClassAdder />
      <TagsContainer title="Class Tags">{renderTags(classTags)}</TagsContainer>
      <ExamImporter />
      <TagsContainer title="Other Tags">
        {renderTags(otherTags)}
        <OtherTagAdder />
      </TagsContainer>
      <CanvasCalendar />
      <div className={styles.FinalRowButtonContainer}>
        <div className={styles.SettingsButton}>
          <button
            type="button"
            className={[styles.FinalRowButton, styles.SignButton].join(' ')}
            onClick={firebaseSignOut}
            title="Sign out of Samwise"
            tabIndex={0}
          >
            Sign Out
          </button>
        </div>
        <a
          className={styles.FeedbackButton}
          href="https://goo.gl/forms/PZUZ1Ze6kN82EmcD2"
          target="_blank"
          rel="noopener noreferrer"
          title="Link to Feedback form"
          tabIndex={0}
        >
          Give Feedback
        </a>
        <span className={styles.Padding} />
        <div className={styles.SettingsButton}>
          <button
            type="button"
            className={[styles.FinalRowButton, styles.ReplayTutorialButton].join(' ')}
            onClick={() => completeOnboarding(false)}
            title="Click to replay tutorial"
            tabIndex={0}
          >
            Replay Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

const Connected = connect(({ tags }: State) => ({ tags }))(SettingsPage);
export default Connected;
