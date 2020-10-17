import { Task } from 'common/types/store-types';
import React, { ReactElement, useState } from 'react';
import styles from './GroupTaskProgress.module.css';
import { GroupDeadline, PeakingBear } from '../../../assets/assets-constants';

type Props = {
  readonly tasks: readonly Task[];
  readonly deadline: Date;
};

const GroupTaskProgress = ({ tasks, deadline }: Props): ReactElement => {
  const tasksDone: number = tasks.filter((task: Task): boolean => task.complete).length;
  const totalTasks: number = tasks.length;
  // must make this listen for changes to tasks
  const [showBar, setShowBar] = useState(totalTasks > 0);
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
        <div className={styles.NoTasks}>
          <img src={PeakingBear} className={styles.PeakingBear} alt="Peaking Bear" />
          <div className={styles.NoTasksText}>
            <p className={styles.CreateTaskTextTop}>Looks like you haven’t created any tasks!</p>
            <p className={styles.CreateTaskTextBottom}>Add a task to get started!</p>
          </div>
        </div>
      ) : (
        <div>hi</div>
      )}
      <div className={styles.Deadline}>
        <img src={GroupDeadline} className={styles.DeadlineIcon} alt="Group deadline" />
        <br />
        <p className={`${styles.GrayBoldText} ${styles.DeadlineDate}`}>{`${
          months[deadline.getMonth()]
        } ${deadline.getDate()}`}</p>
      </div>
    </div>
  );
};

export default GroupTaskProgress;
