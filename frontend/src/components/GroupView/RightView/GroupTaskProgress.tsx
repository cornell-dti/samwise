import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import clsx from 'clsx';
import styles from './GroupTaskProgress.module.scss';
import { GroupDeadline, PeakingBear } from '../../../assets/assets-constants';

type Props = {
  readonly tasks: readonly Task[];
  readonly deadline: Date;
};

type ProgressBubbleProps = {
  readonly completed?: boolean;
  readonly value?: number;
};

const ProgressBubble = ({ completed, value }: ProgressBubbleProps): ReactElement => (
  <div
    className={clsx(
      styles.ProgressBubble,
      completed ? styles.CompleteBubble : styles.IncompleteBubble
    )}
  >
    {value ? `+${value}` : ''}
  </div>
);

const GroupTaskProgress = ({ tasks, deadline }: Props): ReactElement => {
  const tasksDone: number = tasks.filter((task: Task): boolean => task.complete).length;
  const totalTasks: number = tasks.length;
  const tasksNotDone: number = totalTasks - tasksDone;
  const showBar = totalTasks > 0;
  let complete: ReactElement[] = [];
  let incomplete: ReactElement[] = [];
  if (totalTasks <= 20) {
    for (let i = 0; i < tasksDone; i += 1) {
      complete = [...complete, <ProgressBubble completed key={`c${i}`} />];
    }
    for (let i = 0; i < tasksNotDone; i += 1) {
      incomplete = [...incomplete, <ProgressBubble key={`uc${i}`} />];
    }
  } else {
    const completedVal = Math.max(tasksDone - 4, 0);
    for (let i = 0; i < tasksDone; i += 1) {
      if (i < 3) {
        complete = [...complete, <ProgressBubble completed key={`c${i}`} />];
      }
      if (i === tasksDone - 1) {
        complete = [
          ...complete,
          <ProgressBubble
            completed
            value={completedVal >= 2 ? completedVal : undefined}
            key={`c${i}`}
          />,
        ];
      }
    }
    const renderedCompletedTasks = Math.min(tasksDone, 4);
    const incompleteVal = Math.max(tasksNotDone - (20 - renderedCompletedTasks), 0);
    for (let i = 0; i < tasksNotDone; i += 1) {
      if (i < 20 - renderedCompletedTasks) {
        incomplete = [...incomplete, <ProgressBubble key={`uc${i}`} />];
      }
      if (i === tasksNotDone - 1) {
        incomplete = [
          ...incomplete,
          <ProgressBubble value={incompleteVal >= 2 ? incompleteVal : undefined} key={`c${i}`} />,
        ];
      }
    }
  }
  const bubbles: ReactElement[] = [...complete, ...incomplete];
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

  const convertToUTC = (date: Date): Date => {
    const ans = new Date(date);
    ans.setMinutes(ans.getMinutes() - ans.getTimezoneOffset());
    return ans;
  };

  const oneDay: number = 1000 * 60 * 60 * 24;
  // Always round down the number of days left. i.e. if the number of hours
  // left is <24 just say there are 0 days left
  const daysLeft: number = Math.floor(
    Math.max((convertToUTC(deadline).getTime() - convertToUTC(new Date()).getTime()) / oneDay, 0)
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
        <p className={clsx(styles.GrayBoldText, styles.DeadlineDate)}>
          {`${months[deadline.getMonth()]} ${deadline.getDate()}`}
        </p>
      </div>
    </div>
  );
};

export default GroupTaskProgress;
