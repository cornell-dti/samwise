import React, { ReactElement } from 'react';
import ModeIndicator from './components/UI/ModeIndicator';
import ViewSwitcher from './ViewSwitcher';
import { ModalsContainer } from './components/Util/Modals';
import { isGroupTaskEnabled } from './util/gate-keeper';
import PersonalView from './PersonalView';

/**
 * The top level app component.
 */
const GROUP_TASK_ENABLED: boolean = isGroupTaskEnabled();

export default function App(): ReactElement {
  return (
    <>
      <ModeIndicator />
      <ModalsContainer />
      {GROUP_TASK_ENABLED ? <ViewSwitcher /> : <PersonalView />}
    </>
  );
}
