import React, { useState } from 'react';
import type { Group, State } from 'common/types/store-types';
import { useSelector } from 'react-redux';
import SideBar from './components/SideBar';
import PersonalView from './PersonalView';
import GroupView from './components/GroupView';
import styles from './App.module.scss';

/** Handles switching the view from Personal to Group */
const ViewSwitcher = (): React.ReactElement => {
  const groups = useSelector((state: State) => Array.from(state.groups.values()));

  const [group, setGroup] = useState<Group | undefined>();

  const changeView = (selectedGroupID?: string | undefined): void => {
    setGroup(groups.find((oneGroup) => oneGroup.id === selectedGroupID));
  };

  return (
    <div className={styles.GroupScreen}>
      <SideBar groups={groups} changeView={changeView} />
      <div className={styles.GroupScreenContent}>
        {group === undefined ? (
          <PersonalView />
        ) : (
          <GroupView group={group} changeView={changeView} />
        )}
      </div>
    </div>
  );
};

export default ViewSwitcher;
