import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { TasksProgressProps } from '../../../util/task-util';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './ProgressTracker.css';
import { getProgress } from '../../../store/selectors';

const mobileViewStyle = `${styles.ProgressTracker} ${styles.MobileView}`;
const desktopViewStyle = `${styles.ProgressTracker} ${styles.DesktopView}`;

type Props = TasksProgressProps & { readonly inNDaysView: boolean };

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 */
function ProgressTracker(
  { completedTasksCount, allTasksCount, inNDaysView }: Props,
): ReactElement {
  const containerClass = inNDaysView ? mobileViewStyle : desktopViewStyle;
  return (
    <div className={containerClass}>
      <Bear
        completedTasksCount={completedTasksCount}
        allTasksCount={allTasksCount}
        inNDaysView={inNDaysView}
      />
      <ProgressIndicator
        completedTasksCount={completedTasksCount}
        allTasksCount={allTasksCount}
        inNDaysView={inNDaysView}
      />
    </div>
  );
}

const Connected = connect(getProgress)(ProgressTracker);
export default Connected;
