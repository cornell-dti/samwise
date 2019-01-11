// @flow strict

import React from 'react';
import type { Node } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import { firebaseInit } from './util/firebase-util';
import { error } from './util/general-util';
import type { AppUser } from './util/firebase-util';
import { dispatchAction, initializeApp } from './store/store';
import { httpInitializeData } from './http/http-service';
import LoginBarrier from './components/Util/Login/LoginBarrier';
import WindowSizeProvider from './components/Util/Responsive/WindowSizeProvider';

firebaseInit();

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
      <App />
    </ReactReduxProvider>
  );
};

const dummyUser: AppUser = { displayName: 'BAD_USER', email: 'BAD_EMAIL', token: 'BAD_TOKEN' };

/**
 * Whether to disable login.
 * In production, this must be set to false.
 * It can be set to true in development to speed up loading time.
 * @type {boolean}
 */
const disableLogin: boolean = false;

const root = document.getElementById('root') ?? error('The root node is not found!');
ReactDOM.render((
  <WindowSizeProvider>
    {disableLogin ? appRenderer(dummyUser) : <LoginBarrier appRenderer={appRenderer} />}
  </WindowSizeProvider>
), root);
