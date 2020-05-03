import React, { ReactElement } from 'react';
import styles from './App.module.css';
import AllComplete from './components/Popup/AllComplete';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator';
import TaskView from './components/TaskView';
import TitleBar from './components/TitleBar';

/**
 * The top level Personal Samwise view component.
 */
export default (): ReactElement => (
  <>
    <Onboard />
    <TitleBar />
    <TaskCreator />
    <TaskView className={styles.TaskView} />
    <AllComplete />
  </>
);
