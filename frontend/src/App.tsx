import React, { ReactElement, useState } from 'react';
import ModeIndicator from 'components/UI/ModeIndicator';
import SideBar from 'components/SideBar';
import GroupView from 'components/GroupView';
import styles from './App.module.css';
import AllComplete from './components/Popup/AllComplete';
import Onboard from './components/TitleBar/Onboarding/Onboard';
import TaskCreator from './components/TaskCreator';
import TaskView from './components/TaskView';
import TitleBar from './components/TitleBar';
import { ModalsContainer } from './components/Util/Modals';

type Views =
  | 'personal'
  | 'group';

/**
 * The top level app component.
 */
const groups = ['CS 2110', 'CS 3110', 'INFO 3450'];

export default function App(): ReactElement {
  const [view, setView] = useState('personal');
  const [group, setGroup] = useState('');

  const changeView = (selectedView: Views, selectedGroup?: string | undefined): void => {
    setView(selectedView);
    if (selectedGroup !== undefined) {
      setGroup(selectedGroup);
    }
  };
  return (
    <div className={styles.Container}>
      <ModeIndicator />
      <SideBar groups={groups} changeView={changeView} />
      {
        view === 'personal' && (
          <div className={styles.MainView}>
            <Onboard />
            <ModalsContainer />
            <TitleBar />
            <TaskCreator />
            <TaskView className={styles.TaskView} />
            <AllComplete />
          </div>
        )
      }
      {
        view === 'group' && (
          <GroupView groupName={group} />
        )
      }
    </div>
  );
}
