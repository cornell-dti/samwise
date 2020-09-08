import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Confetti from 'react-dom-confetti';
import { TasksProgressProps } from 'common/lib/util/task-util';
import styles from './Celebrate.module.scss';
import { getProgress } from '../../../store/selectors';

type Props = TasksProgressProps;

/**
 * The all tasks complete page. Displays after a user completes all focused tasks.
 */
export function AllComplete({ completedTasksCount, allTasksCount }: Props): ReactElement | null {
  // Simple FSM. 0 = initial, 1 = saw unfinished tasks, 2 = finished all, 3 = hidden
  const [progress, setProgress] = React.useState<0 | 1 | 2 | 3>(0);

  const percent = completedTasksCount / allTasksCount;

  switch (progress) {
    case 0:
    case 3:
      if (allTasksCount > 0 && percent < 1) {
        setProgress(1);
      }
      return null;
    case 1:
      if (allTasksCount > 0 && percent >= 1) {
        setProgress(2);
      }
      break;
    case 2:
      if (allTasksCount > 0 && percent < 1) {
        setProgress(1);
      }
      break;
    default:
  }

  const shouldShow = progress === 2;

  // const hidePopup = (): void => setProgress(3);

  const confettiConfig = {
    angle: 0,
    spread: 360,
    startVelocity: 18,
    elementCount: 200,
    dragFriction: 0.1,
    duration: 3000,
    delay: 0,
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  const showClass = shouldShow ? styles.Main : `${styles.Main} ${styles.Hidden}`;

  return (
    <div className={showClass}>
      <span className={styles.ConfWrap}>
        <Confetti active={shouldShow} config={confettiConfig} />
      </span>
    </div>
  );
}

const Connected = connect(getProgress)(AllComplete);
export default Connected;
