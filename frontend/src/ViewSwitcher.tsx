import React, { useState } from 'react';
import type { State } from 'common/types/store-types';
import { useSelector } from 'react-redux';
import SideBar from './components/SideBar';
import PersonalView from './PersonalView';
import GroupView from './components/GroupView';
import styles from './App.module.scss';
import { useMappedWindowSize } from './hooks/window-size-hook';

/** Handles switching the view from Personal to Group */
const ViewSwitcher = (): React.ReactElement => {
  const groups = useSelector((state: State) => Array.from(state.groups.values()));

  const [selectedGroupID, setSelectedGroupID] = useState<string | undefined>();
  const selectedGroup = groups.find((oneGroup) => oneGroup.id === selectedGroupID);
  const isSmallScreen = useMappedWindowSize(({ width }) => width <= 840);

  return (
    <div className={isSmallScreen ? styles.MobileScreen : styles.GroupScreen}>
      {!isSmallScreen && <SideBar groups={groups} changeView={setSelectedGroupID} />}
      <div className={styles.GroupScreenContent}>
        {selectedGroup === undefined ? (
          <PersonalView />
        ) : (
          <GroupView group={selectedGroup} changeView={setSelectedGroupID} />
        )}
      </div>
    </div>
  );
};

export default ViewSwitcher;
