// @flow strict

import * as React from 'react';
import type { Node } from 'react';
import TagItem from '../Tags/TagItem';
import ClassTagAdder from '../Tags/ClassTagAdder';
import styles from './Onboard.css';
import type { Tag, Task } from '../../../store/store-types';
import { importCourseExams } from '../../../store/actions';
import { dispatchConnect, stateConnect } from '../../../store/react-redux-util';

/**
 * The class adder component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
const ClassAdder = (): Node => (
  <div className={styles.SettingsSection}>
    <div className={styles.SettingsSectionContent}>
      <ClassTagAdder />
    </div>
  </div>
);

/**
 * The exam exporter component.
 *
 * @return {Node} rendered component.
 * @constructor
 */
const ExamImporter = dispatchConnect({ onClick: importCourseExams })(({ onClick }) => (
  <button type="button" onClick={onClick} className={styles.SignButton}>Import Exams</button>
));

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

type Props = {| +tags: Tag[]; +tasks: Task[]; |};
type State = {| +progress: number; +shouldDisp: boolean; |};

/**
 * The settings page.
 *
 * @param {Tag[]} tags all the tags.
 * @return {Node} the rendered editor.
 * @constructor
 */
class Onboard extends React.PureComponent<Props, State> {
  state: State = { progress: 0, shouldDisp: false };

  showNext = () => this.setState((state: State) => ({ ...state, progress: state.progress + 1 }));

  goBack = () => this.setState((state: State) => {
    const { progress } = state;
    if (progress > 1) {
      return { progress: progress - 1 };
    }
    return {};
  });

  skipTutorial = () => this.setState(state => ({ ...state, progress: 100 }));

  render() {
    const classTags: Tag[] = [];
    const otherTags: Tag[] = [];
    const { tags, tasks } = this.props;
    const { shouldDisp, progress } = this.state;
    tags.forEach((tag) => {
      if (tag.classId !== null) {
        classTags.push(tag);
      } else if (tag.name !== 'None') {
        otherTags.push(tag);
      }
    });

    if (classTags.length === 0 && otherTags.length === 0 && tasks.length === 0) {
      // Using an if statement here b/c we want shouldDisp's value to persist
      // even after a couple of tags have been added
      this.setState(state => ({ ...state, shouldDisp: true }));
    }
    const renderTags = (arr: Tag[]): Node => arr.map((tag: Tag) => (
      <TagItem key={tag.id} tag={tag} />
    ));

    const importAll = (r) => {
      const images = {};
      r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
      return images;
    };

    const images = importAll(require.context('../../../assets/tutorial', false, /\.(png|jpe?g|svg)$/));

    return (
      <div
        className={styles.Hero}
        style={{
          display: shouldDisp && progress < 7 ? 'block' : 'none',
          overflowY: progress > 0 ? 'hidden' : '',
          background: progress > 0 ? 'rgba(0,0,0,0.8)' : '',
        }}
      >
        <div style={{ display: progress === 0 ? 'block' : 'none', padding: '60px 40px' }}>
          <p className={styles.HeroIntroText}>
            Hi! Help us boost your productivity by creating some tags.
            <br />
            Search and add the classes you are currently enrolled in to tag them.
          </p>
          <ClassAdder />
          <h2>Class Tags</h2>
          <TagsContainer title="Class Tags">
            {renderTags(classTags)}
          </TagsContainer>
          <div>
            <ExamImporter />
            <button
              type="button"
              className={styles.SignButton}
              onClick={this.showNext}
              style={{ display: classTags.length !== 0 ? 'block' : 'none' }}
            >
              Done
            </button>
          </div>
        </div>
        <div style={{ display: progress > 0 ? 'block' : 'none' }} className={styles.ModalWrap}>
          <h2>Tutorial</h2>
          <div className={styles.TutorialModal}>
            <button type="button" onClick={this.goBack}>&lsaquo;</button>
            <img
              className={styles.TutorialImg}
              src={progress > 0 && progress < 7 ? images[`t${progress}.png`] : ''}
              alt="Tutorial"
            />
            <button type="button" onClick={this.showNext}>&rsaquo;</button>
          </div>
          <p className={styles.ModalOptions}>
            <button type="button" onClick={this.skipTutorial} style={{ marginRight: '30px' }}>
              Start using Samwise now &rarr;
            </button>
          </p>
        </div>
      </div>
    );
  }
}

const Connected = stateConnect<Props, Props>(
  ({ tags, tasks }) => ({ tags, tasks }),
)(Onboard);
export default Connected;
