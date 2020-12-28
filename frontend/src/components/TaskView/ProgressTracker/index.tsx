import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { TasksProgressProps } from 'common/util/task-util';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './index.module.scss';
import { getProgress } from '../../../store/selectors';

type Props = TasksProgressProps & { readonly inMobileView: boolean };

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 */
export function ProgressTracker({
  completedTasksCount,
  allTasksCount,
  inMobileView,
}: Props): ReactElement {
  return (
    <div
      className={clsx(
        styles.ProgressTracker,
        inMobileView ? styles.MobileView : styles.DesktopView
      )}
    >
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
