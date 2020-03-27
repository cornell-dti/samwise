import React, { ReactElement } from 'react';
import ModeIndicator from 'components/UI/ModeIndicator';
import SideBar from 'components/SideBar';
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
const groups = ['CS 2110', 'CS 3110', 'INFO 3450'];

export default function App(): ReactElement {
  return (
    <div className={styles.Container}>
      <SideBar groups={groups} />
      <div className={styles.MainView}>
        <ModeIndicator />
        <Onboard />
        <ModalsContainer />
        <TitleBar />
        <TaskCreator />
        <TaskView className={styles.TaskView} />
        <AllComplete />
      </div>
    </div>
  );
}
