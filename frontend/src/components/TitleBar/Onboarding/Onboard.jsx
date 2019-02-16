// @flow strict

import * as React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import TagItem from '../Tags/TagItem';
import ClassTagAdder from '../Tags/ClassTagAdder';
import styles from './Onboard.css';
import type { Tag, Task } from '../../../store/store-types';
import Tutorial1 from '../../../assets/tutorial/t1.png';
import Tutorial2 from '../../../assets/tutorial/t2.png';
import Tutorial3 from '../../../assets/tutorial/t3.png';
import Tutorial4 from '../../../assets/tutorial/t4.png';
import Tutorial5 from '../../../assets/tutorial/t5.png';
import Tutorial6 from '../../../assets/tutorial/t6.png';
import { importCourseExams } from '../../../firebase/actions';

const images = [Tutorial1, Tutorial2, Tutorial3, Tutorial4, Tutorial5, Tutorial6];

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

const ExamImporter = () => (
  <button type="button" onClick={importCourseExams} className={styles.SignButton}>
    Import Exams
  </button>
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
  constructor(props: Props) {
    super(props);
    const { tags, tasks } = props;
    // We set state based on props here b/c we want shouldDisp's value to persist
    // even after a couple of tags have been added
    const shouldDisp = tags.length === 1 && tasks.length === 0;
    this.state = { progress: 0, shouldDisp };
  }

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
    const { tags } = this.props;
    const { shouldDisp, progress } = this.state;
    tags.forEach((tag) => {
      if (tag.classId !== null) {
        classTags.push(tag);
      }
    });

    const renderTags = (arr: Tag[]): Node => arr.map((tag: Tag) => (
      <TagItem key={tag.id} tag={tag} />
    ));

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
              src={progress > 0 && progress < 7 ? images[progress - 1] : ''}
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

const Connected: ComponentType<{||}> = connect(({ tags, tasks }) => ({ tags, tasks }))(Onboard);
export default Connected;
