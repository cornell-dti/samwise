import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Confetti from 'react-dom-confetti';
import styles from './Celebrate.css';
import { State, Tag } from '../../../store/store-types';
import Bear from '../../../assets/bear/happy-bear.png';

type Props = { readonly classTags: Tag[]; readonly completedOnboarding: boolean };

/**
 * The all tasks complete page. Displays after a user completes all focused tasks.
 */
function AllComplete(): ReactElement | null {
  const [completed, setCompleted] = React.useState<boolean>(false);

  /* if (completed) {
    // the conditions not to display the screen
    return null;
  } */
  // const showConfetti = false;

  const hidePopup = (): void => setCompleted(true);

  const confettiConfig = {
    angle: 0,
    spread: 360,
    startVelocity: 25,
    elementCount: 200,
    dragFriction: 0.1,
    duration: 3000,
    delay: 0,
    width: '10px',
    height: '10px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  return (
    <div className={styles.Main}>
      <img src={Bear} alt="Happy Sam" />
      <div>
        <h1>You Did It!</h1>
        <p>You completed all your tasks for today!</p>
        <p>Why not take a well deserved break?</p>
        <p>Once you&apos;re back, consider getting a head-start on tomorrow.</p>
        <span className={styles.ConfWrap}>
          <Confetti active={completed} config={confettiConfig} />
        </span>
        <button onClick={hidePopup} type="button">Alright</button>
      </div>
    </div>
  );
}

const Connected = connect(
  ({ tags, settings: { completedOnboarding } }: State): Props => {
    const classTags: Tag[] = Array.from(tags.values()).filter(t => t.classId != null);
    return { classTags, completedOnboarding };
  },
)(AllComplete);
export default Connected;
