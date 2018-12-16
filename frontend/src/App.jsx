// @flow strict

import React from 'react';
import styles from './App.css';
import NewTaskComponent from './components/NewTask/NewTaskComponent';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import type { AppUser } from './util/firebase-util';
import Login from './components/Login/Login';
import { httpInitializeData } from './http/http-service';
import store from './store';

type Props = {| +user: AppUser | null |};

export default function App({ user }: Props) {
  if (user == null) {
    return (<Login />);
  }
  httpInitializeData().then(a => store.dispatch(a));
  return (
    <div className={styles.App}>
      <TitleBar />
      <NewTaskComponent />
      <TaskView />
    </div>
  );
}
