// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { ToastContainer } from 'react-toastify';
import { connect } from 'react-redux';
import styles from './App.css';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator/TaskCreator';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import ProgressTracker from './components/ProgressTracker/ProgressTracker';
import { computeTaskProgress, filterInFocusTasks } from './util/task-util';
import type { State } from './store/store-types';
import type { TasksProgress } from './util/task-util';

type Props = {|
  +taskIds: number[];
  +focusedTaskIds: number[];
  +progress: TasksProgress;
|};

/**
 * The top level app component.
 */
function App({ taskIds, focusedTaskIds, progress }: Props): Node {
  return (
    <div>
      <Onboard />
      <ToastContainer className={styles.Toast} />
      <TitleBar />
      <TaskCreator />
      <TaskView taskIds={taskIds} focusedTaskIds={focusedTaskIds} />
      <ProgressTracker progress={progress} />
    </div>
  );
}

const mapStateToProps = ({ tasks }: State) => {
  const taskArray = Object.keys(tasks).map(k => tasks[k]);
  const inFocusTaskArray = filterInFocusTasks(taskArray);
  const progress = computeTaskProgress(inFocusTaskArray);
  return {
    taskIds: taskArray.map(t => t.id),
    focusedTaskIds: inFocusTaskArray.map(t => t.id),
    progress,
  };
};

const ConnectedApp: ComponentType<{||}> = connect(mapStateToProps)(App);
export default ConnectedApp;
