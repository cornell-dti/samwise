import React, { useState } from 'react';
import type { State } from 'common/types/store-types';
import { useSelector } from 'react-redux';
import SideBar from './components/SideBar';
import PersonalView from './PersonalView';
import GroupView from './components/GroupView';
import styles from './App.module.scss';

/** Handles switching the view from Personal to Group */
const ViewSwitcher = (): React.ReactElement => {
  const groups = useSelector((state: State) => Array.from(state.groups.values()));

  const [selectedGroupID, setSelectedGroupID] = useState<string | undefined>();
  const selectedGroup = groups.find((oneGroup) => oneGroup.id === selectedGroupID);

  return (
    <div className={styles.GroupScreen}>
      <SideBar groups={groups} changeView={setSelectedGroupID} />
      <div>
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
