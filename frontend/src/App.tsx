import React, { ReactElement } from 'react';
import ModeIndicator from './components/UI/ModeIndicator';
import ViewSwitcher from './ViewSwitcher';
import { ModalsContainer } from './components/Util/Modals';

/**
 * The top level app component.
 */

export default function App(): ReactElement {
  return (
    <>
      <ModeIndicator />
      <ModalsContainer />
      <ViewSwitcher />
    </>
  );
}
