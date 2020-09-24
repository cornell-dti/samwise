import React, { useState } from 'react';
import SideBar from './components/SideBar';
import PersonalView from './PersonalView';
import GroupView from './components/GroupView';
import styles from './App.module.scss';

type Views = 'personal' | 'group';

/** Handles switching the view from Personal to Group */
const ViewSwitcher = (): React.ReactElement => {
  const groups = ['CS 2110', 'CS 3110', 'INFO 3450'];

  const [view, setView] = useState<Views>('personal');
  const [group, setGroup] = useState('');

  const changeView = (selectedView: Views, selectedGroup?: string | undefined): void => {
    setView(selectedView);
    if (selectedGroup !== undefined) {
      setGroup(selectedGroup);
    }
  };

  return (
    <div className={styles.GroupScreen}>
      <SideBar groups={groups} changeView={changeView} />
      <div>{view === 'personal' ? <PersonalView /> : <GroupView groupName={group} />}</div>
    </div>
  );
};

export default ViewSwitcher;
