import React from 'react';
import FocusViewContainer from '../../../TaskView/FocusView/FocusViewContainer';
import styles from './index.module.css';

export default (): React.ReactElement => (
  <div className={styles.TaskQueue}>
    <h2>Task Queue</h2>
    <FocusViewContainer />
  </div>
);
