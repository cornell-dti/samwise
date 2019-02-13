// @flow strict

import '@babel/polyfill';
import React from 'react';
import type { Node } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import { firebaseInit } from './util/firebase-util';
import { error } from './util/general-util';
import { store } from './store/store';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import WindowSizeProvider from './components/Util/Responsive/WindowSizeProvider';

firebaseInit();

/**
 * The function to render the entire app when the login flow finishes.
 */
const appRenderer = (): Node => (
  <ReactReduxProvider store={store}>
    <App />
  </ReactReduxProvider>
);

const root = document.getElementById('root') ?? error('The root node is not found!');
ReactDOM.render((
  <WindowSizeProvider>
    <LoginBarrier appRenderer={appRenderer} />
  </WindowSizeProvider>
), root);
