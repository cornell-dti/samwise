// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import styles from './App.css';
import TaskCreator from './components/TaskCreator/TaskCreator';
import TaskView from './components/TaskView/TaskView';
import TitleBar from './components/TitleBar/TitleBar';
import type { AppUser } from './util/firebase-util';
import LoginBarrier from './components/Util/Login/LoginBarrier';
import { httpInitializeData } from './http/http-service';
import { initializeApp, dispatchAction } from './store/store';
import WindowSizeProvider from './components/Util/Responsive/WindowSizeProvider';

/**
 * Whether to disable login.
 * In production, this must be set to false.
 * It can be set to true in development to speed up loading time.
 * @type {boolean}
 */
const disableLogin: boolean = false;

/**
 * The function to render the entire app given a user.
 *
 * @param {AppUser} appUser the user of the app.
 * @return {Node} the rendered app node.
 */
const appRenderer = (appUser: AppUser): Node => {
  const store = initializeApp(appUser);
  httpInitializeData().then(a => dispatchAction(a));
  return (
    <ReactReduxProvider store={store}>
      <div className={styles.App}>
        <ToastContainer className={styles.Toast} />
        <TitleBar />
        <TaskCreator />
        <TaskView />
      </div>
    </ReactReduxProvider>
  );
};

const dummyUser: AppUser = { displayName: 'BAD_USER', email: 'BAD_EMAIL', token: 'BAD_TOKEN' };

export default (): Node => (
  <WindowSizeProvider>
    {disableLogin ? appRenderer(dummyUser) : <LoginBarrier appRenderer={appRenderer} />}
  </WindowSizeProvider>
);
