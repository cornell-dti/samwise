import React, { ReactElement } from 'react';
import ModeIndicator from 'components/UI/ModeIndicator';
import styles from './App.module.css';
import AllComplete from './components/Popup/AllComplete';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator';
import TaskView from './components/TaskView';
import TitleBar from './components/TitleBar';
import { ModalsContainer } from './components/Util/Modals';

/**
 * The top level app component.
 */
export default function App(): ReactElement {
  return (
    <>
      <ModeIndicator />
      <Onboard />
      <ModalsContainer />
      <TitleBar />
      <TaskCreator />
      <TaskView className={styles.TaskView} />
      <AllComplete />
    </>
  );
}
