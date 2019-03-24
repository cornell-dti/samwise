import React, { ReactElement, CSSProperties, useState } from 'react';
import { connect } from 'react-redux';
import TagItem from '../Tags/TagItem';
import ClassTagAdder from '../Tags/ClassTagAdder';
import styles from './Onboard.css';
import { State, Tag } from '../../../store/store-types';
import Tutorial1 from '../../../assets/tutorial/t1.png';
import Tutorial2 from '../../../assets/tutorial/t2.png';
import Tutorial3 from '../../../assets/tutorial/t3.png';
import Tutorial4 from '../../../assets/tutorial/t4.png';
import Tutorial5 from '../../../assets/tutorial/t5.png';
import Tutorial6 from '../../../assets/tutorial/t6.png';
import { completeOnboarding, importCourseExams } from '../../../firebase/actions';

type TaggedImage = { readonly src: string; readonly alt: string }

const taggedImages: TaggedImage[] = [
  {
    src: Tutorial1,
    alt: 'Sam is your personal assistant.',
  },
  {
    src: Tutorial2,
    alt: 'Add tasks in the box \'What do you have to do?\'',
  },
  {
    src: Tutorial3,
    alt: 'Press the pin icon to move a task to focus view. Press the unpin icon to remove it.',
  },
  {
    src: Tutorial4,
    alt: 'Tasks added will go into future view',
  },
  {
    src: Tutorial5,
    alt: 'You can track the progress in the progress bar',
  },
  {
    src: Tutorial6,
    alt: 'You can review the tutorial and edit tags and classes in settings',
  },
];

type AddClassProps = { readonly classTags: Tag[]; readonly showNext: () => void };

/**
 * Adding class as the first onboarding step.
 */
function AddClassOnBoarding({ classTags, showNext }: AddClassProps): ReactElement {
  return (
    <div style={{ padding: '60px 40px' }}>
      {/* some random intro */}
      <p className={styles.HeroIntroText}>
        Hi! Help us boost your productivity by creating some tags.
        <br />
        Search and add the classes you are currently enrolled in to tag them.
      </p>
      {/* class adder */}
      <div className={styles.SettingsSection}>
        <div className={styles.SettingsSectionContent}>
          <ClassTagAdder />
        </div>
      </div>
      {/* display all class tags */}
      <h2>Class Tags</h2>
      <div className={styles.SettingsSection}>
        <p className={styles.SettingsSectionTitle}>Class Tags</p>
        <div className={styles.SettingsSectionContent}>
          <ul className={styles.ColorConfigItemList}>
            {classTags.map(tag => <TagItem key={tag.id} tag={tag} />)}
          </ul>
        </div>
      </div>
      {/* buttons */}
      <div className={styles.SignButtonContainer}>
        <button type="button" onClick={importCourseExams} className={styles.SignButton}>
          Import Exams
        </button>
        <span className={styles.Padding} />
        <button type="button" className={styles.SignButton} onClick={showNext}>
          {classTags.length > 0 ? 'Done' : 'Skip Adding Classes'}
        </button>
      </div>
    </div>
  );
}

type SlidesProps = {
  readonly progress: number;
  readonly showNext: () => void;
  readonly goBack: () => void;
  readonly skipTutorial: () => void;
};

/**
 * Showing slides as the second onboarding step.
 */
function SlidesOnBoarding({ progress, showNext, goBack, skipTutorial }: SlidesProps): ReactElement {
  const { src, alt } = taggedImages[progress - 1];
  return (
    <div className={styles.ModalWrap}>
      <h2>Tutorial</h2>
      <div className={styles.TutorialModal}>
        <button type="button" onClick={goBack}>&lsaquo;</button>
        <img className={styles.TutorialImg} src={src} alt={alt} />
        <button type="button" onClick={showNext}>&rsaquo;</button>
      </div>
      <p className={styles.ModalOptions}>
        <button type="button" onClick={skipTutorial} style={{ marginRight: '30px' }}>
          Start using Samwise now &rarr;
        </button>
      </p>
    </div>
  );
}

type Props = { readonly classTags: Tag[]; readonly completedOnboarding: boolean };

/**
 * The onboarding page. Displayed only if the user chooses to do so or during first landing.
 */
function Onboard({ classTags, completedOnboarding }: Props): ReactElement | null {
  const [progress, setProgress] = useState<number>(0);

  if (completedOnboarding || progress >= 7) {
    if (progress >= 7) {
      setProgress(0);
    }
    completeOnboarding(true);
    // the conditions not to display the tutorial
    return null;
  }

  const showNext = (): void => setProgress(prev => prev + 1);
  const goBack = (): void => setProgress(prev => (prev > 1 ? prev - 1 : prev));
  const skipTutorial = (): void => setProgress(100);

  const onboardingContainerStyle: CSSProperties | undefined = progress > 0
    ? { overflowY: 'hidden', background: 'rgba(0,0,0,0.8)' }
    : undefined;
  return (
    <div className={styles.Hero} style={onboardingContainerStyle}>
      {progress === 0 && <AddClassOnBoarding classTags={classTags} showNext={showNext} />}
      {progress > 0 && (
        <SlidesOnBoarding
          progress={progress}
          showNext={showNext}
          goBack={goBack}
          skipTutorial={skipTutorial}
        />
      )}
    </div>
  );
}

const Connected = connect(
  ({ tags, settings: { completedOnboarding } }: State): Props => {
    const classTags: Tag[] = Array.from(tags.values()).filter(t => t.classId != null);
    return { classTags, completedOnboarding };
  },
)(Onboard);
export default Connected;
