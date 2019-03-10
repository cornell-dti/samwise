import React, { ReactElement, CSSProperties } from 'react';
import { connect } from 'react-redux';
import { TasksProgressProps } from '../../../util/task-util';
import Bear from './Bear';
import ProgressIndicator from './ProgressIndicator';
import styles from './ProgressTracker.css';
import { getProgress } from '../../../store/selectors';

const nDaysViewStyle = `${styles.ProgressTracker} ${styles.NDaysView}`;
const otherViewStyle = `${styles.ProgressTracker} ${styles.OtherViews}`;

type Props = TasksProgressProps & { readonly inNDaysView: boolean };

/**
 * The progress tracker component.
 * It is a wrapper component designed to pass down the progress object.
 */
function ProgressTracker(
  { completedTasksCount, allTasksCount, inNDaysView }: Props,
): ReactElement {
  const containerClass = inNDaysView ? nDaysViewStyle : otherViewStyle;
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
