import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Confetti from 'react-dom-confetti';
import styles from './Celebrate.css';
import { State, Task } from '../../../store/store-types';
import Bear from '../../../assets/bear/happy-bear.png';

type Props = { readonly focusTasks: Task[] };

/**
 * The all tasks complete page. Displays after a user completes all focused tasks.
 */
function AllComplete({ focusTasks }: Props): ReactElement | null {
  const [completed, setCompleted] = React.useState<boolean>(false);

  /* if (completed) {
    // the conditions not to display the screen
    return null;
  } */
  // const showConfetti = false;
  const completedTasks = focusTasks.length > 0 && focusTasks.every(t => t.complete);
  const shouldShow = !completedTasks || completed;

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
    <div className={styles.Main} style={{ display: shouldShow ? 'none' : undefined }}>
      <img src={Bear} alt="Happy Sam" />
      <div>
        <h1>You Did It!</h1>
        <p>You completed all your tasks for today!</p>
        <p>Why not take a well deserved break?</p>
        <p>Once you&apos;re back, consider getting a head-start on tomorrow.</p>
        <span className={styles.ConfWrap}>
          <Confetti active={!shouldShow} config={confettiConfig} />
        </span>
        <button onClick={hidePopup} type="button">Alright</button>
      </div>
    </div>
  );
}

const Connected = connect(
  ({ tasks }: State): Props => {
    const focusTasks: Task[] = Array.from(tasks.values()).filter(t => t.inFocus);
    return { focusTasks };
  },
)(AllComplete);
export default Connected;
