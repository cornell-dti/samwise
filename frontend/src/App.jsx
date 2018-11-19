// @flow strict

import React from 'react';
import styles from './App.css';
// $FlowFixMe
import NewTaskComponent from './components/NewTask/NewTaskComponent';
import TaskView from './components/TaskView/TaskView';
// $FlowFixMe
import TitleBar from './components/TitleBar/TitleBar';
import type { FirebaseUser } from './util/firebase-util';
import Login from './components/Login/Login';

type Props = {| +user: FirebaseUser | null |};

export default function App({ user }: Props) {
  if (user == null) {
    return (<Login />);
  }
  return (
    <div className={styles.App}>
      <TitleBar />
      <NewTaskComponent />
      <TaskView />
    </div>
  );
}
