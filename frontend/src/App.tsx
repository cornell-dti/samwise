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
import { isGroupTaskEnabled } from './util/gate-keeper';

type Views =
  | 'personal'
  | 'group';

/**
 * The top level app component.
 */
const groups = ['CS 2110', 'CS 3110', 'INFO 3450'];

const GROUP_TASK_ENABLED: boolean = isGroupTaskEnabled();

const PersonalMainView = (): React.ReactElement => (
  <div className={styles.MainView}>
    <Onboard />
    <TitleBar />
    <TaskCreator />
    <TaskView className={styles.TaskView} />
    <AllComplete />
  </div>
);

type MainViewProps = {
  readonly view: string;
  readonly group: string;
}

const MainView = ({ view, group }: MainViewProps): ReactElement => (
  view === 'personal'
    ? <PersonalMainView />
    : <GroupView groupName={group} />
);

export default function App(): ReactElement {
  const [view, setView] = useState<Views>('personal');
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
      <ModalsContainer />
      {
        GROUP_TASK_ENABLED
          ? (
            <div className={styles.GroupScreen}>
              <SideBar groups={groups} changeView={changeView} />
              <MainView view={view} group={group} />
            </div>
          )
          : <PersonalMainView />
      }
    </div>
  );
}
