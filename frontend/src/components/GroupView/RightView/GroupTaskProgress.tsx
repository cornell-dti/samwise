import { Task } from 'common/types/store-types';
import React, { ReactElement } from 'react';
import styles from './GroupTaskProgress.module.css';

type Props = {
  readonly tasks: readonly Task[];
  readonly deadline: Date;
};

const GroupTaskProgress = ({ tasks, deadline }: Props): ReactElement => {
  const tasksDone: number = tasks.filter((task: Task): boolean => task.complete).length;
  const totalTasks: number = tasks.length;
  const oneDay: number = 1000 * 60 * 60 * 24;
  const deadlineDate: Date = deadline.toDate();
  // Always round down the number of days left. i.e. if the number of hours
  // left is <24 just say there are 0 days left
  const daysLeft: number = Math.floor(
    Math.max((deadlineDate.getTime() - new Date().getTime()) / oneDay, 0)
  );
  return (
    <div>
      <div className={styles.DaysUntilDeadline}>
        {daysLeft} day{daysLeft === 1 ? '' : 's'} before deadline
      </div>
    </div>
  );
};

export default GroupTaskProgress;
