// @flow strict

import React from 'react';
import type { Node } from 'react';
import { ToastContainer } from 'react-toastify';
import styles from './App.css';
import TaskCreator from './components/TaskCreator/TaskCreator';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import ProgressTracker from './components/ProgressTracker/ProgressTracker';
import type { TasksProps } from './util/task-util';
import { computeTaskProgress, filterInFocusTasks, tasksConnect } from './util/task-util';

/**
 * The top level app component.
 *
 * @param tasks all tasks.
 * @return {Node} the rendered app.
 * @constructor
 */
function App({ tasks }: TasksProps): Node {
  const inFocusTasks = filterInFocusTasks(tasks);
  const progress = computeTaskProgress(inFocusTasks);
  return (
    <div>
      <ToastContainer className={styles.Toast} />
      <TitleBar />
      <TaskCreator />
      <TaskView fullTasks={tasks} inFocusTasks={inFocusTasks} />
      <ProgressTracker progress={progress} />
    </div>
  );
}

const ConnectedApp = tasksConnect<TasksProps>(App);
export default ConnectedApp;
