import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import styles from './GroupTaskProgress.module.css';
import { GroupDeadline, PeakingBear } from '../../../assets/assets-constants';

type Props = {
  readonly tasks: readonly Task[];
  readonly deadline: Date;
  readonly showBar: boolean;
};

type ProgressBubbleProps = {
  readonly completed?: boolean;
};

const ProgressBubble = ({ completed }: ProgressBubbleProps): ReactElement => (
  <div
    className={`${styles.ProgressBubble} ${
      completed ? styles.CompleteBubble : styles.IncompleteBubble
    }`}
  />
);

const GroupTaskProgress = ({ tasks, deadline, showBar }: Props): ReactElement => {
  const tasksDone: number = tasks.filter((task: Task): boolean => task.complete).length;
  const totalTasks: number = tasks.length;
  let bubbles: ReactElement[] = [];
  for (let i = 0; i < tasksDone; i += 1) {
    bubbles = [...bubbles, <ProgressBubble completed key={`c${i}`} />];
  }
  for (let i = 0; i < totalTasks - tasksDone; i += 1) {
    bubbles = [...bubbles, <ProgressBubble key={`uc${i}`} />];
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const oneDay: number = 1000 * 60 * 60 * 24;
  // Always round down the number of days left. i.e. if the number of hours
  // left is <24 just say there are 0 days left
  const daysLeft: number = Math.floor(
    Math.max((deadline.getTime() - new Date().getTime()) / oneDay, 0)
  );
  return (
    <div className={styles.GroupProgress}>
      <div className={styles.DaysUntilDeadline}>
        {daysLeft} day{daysLeft === 1 ? '' : 's'}
        <br />
        <span className={styles.GrayBoldText}>before deadline</span>
      </div>
      {showBar ? (
        <div className={styles.ProgressDiv}>{bubbles}</div>
      ) : (
        <div className={styles.NoTasks}>
          <img src={PeakingBear} className={styles.PeakingBear} alt="Peaking Bear" />
          <div className={styles.NoTasksText}>
            <p className={styles.CreateTaskTextTop}>Looks like you haven’t created any tasks!</p>
            <p className={styles.CreateTaskTextBottom}>Add a task to get started!</p>
          </div>
        </div>
      )}
      <div className={styles.Deadline}>
        <img src={GroupDeadline} className={styles.DeadlineIcon} alt="Group deadline" />
        <p className={`${styles.GrayBoldText} ${styles.DeadlineDate}`}>{`${
          months[deadline.getMonth()]
        } ${deadline.getDate()}`}</p>
      </div>
    </div>
  );
};

export default GroupTaskProgress;
