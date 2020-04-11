/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactElement } from 'react';
import styles from './index.module.css';
import ClearFocus from './ClearFocus';
import FocusViewContainer from './FocusViewContainer';

/**
 * The focus view component.
 */
export default (): ReactElement => (
  <div className={styles.FocusView}>
    <div className={styles.ControlBlock}>
      <h3 className={styles.Title}>Focus</h3>
      <span className={styles.Padding} />
      <ClearFocus />
    </div>
    <FocusViewContainer />
  </div>
);
