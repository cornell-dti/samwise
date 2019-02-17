// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { ToastContainer } from 'react-toastify';
import styles from './App.css';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator/TaskCreator';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import ProgressTracker from './components/ProgressTracker/ProgressTracker';
import { computeTaskProgress, filterInFocusTasks, tasksConnect } from './util/task-util';
import type { Task } from './store/store-types';

/**
 * The top level app component.
 */
function App({ tasks }: {| +tasks: Task[] |}): Node {
  const inFocusTasks = filterInFocusTasks(tasks);
  const progress = computeTaskProgress(inFocusTasks);
  return (
    <div>
      <Onboard />
      <ToastContainer className={styles.Toast} />
      <TitleBar />
      <TaskCreator />
      <TaskView fullTasks={tasks} inFocusTasks={inFocusTasks} />
      <ProgressTracker progress={progress} />
    </div>
  );
}

const ConnectedApp: ComponentType<{||}> = tasksConnect(App);
export default ConnectedApp;
