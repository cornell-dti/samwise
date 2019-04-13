import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { TasksProgressProps } from '../../../util/task-util';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './index.module.css';
import { getProgress } from '../../../store/selectors';

const mobileViewStyle = `${styles.ProgressTracker} ${styles.MobileView}`;
const desktopViewStyle = `${styles.ProgressTracker} ${styles.DesktopView}`;

type Props = TasksProgressProps & { readonly inMobileView: boolean };

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 */
function ProgressTracker(
  { completedTasksCount, allTasksCount, inMobileView }: Props,
): ReactElement {
  const containerClass = inMobileView ? mobileViewStyle : desktopViewStyle;
  return (
    <div className={containerClass}>
      <Bear
        completedTasksCount={completedTasksCount}
        allTasksCount={allTasksCount}
        inMobileView={inMobileView}
      />
      <ProgressIndicator
        completedTasksCount={completedTasksCount}
        allTasksCount={allTasksCount}
        inMobileView={inMobileView}
      />
    </div>
  );
}

const Connected = connect(getProgress)(ProgressTracker);
export default Connected;
