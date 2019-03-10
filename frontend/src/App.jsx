// @flow strict

import React from 'react';
import type { Node } from 'react';
import { ToastContainer } from 'react-toastify';
import styles from './App.module.css';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator/TaskCreator';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import ProgressTracker from './components/ProgressTracker/ProgressTracker';

/**
 * The top level app component.
 */
export default function App(): Node {
  return (
    <div>
      <Onboard />
      <ToastContainer className={styles.Toast} />
      <TitleBar />
      <TaskCreator />
      <TaskView />
      <ProgressTracker />
    </div>
  );
}