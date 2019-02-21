// @flow strict

import '@babel/polyfill';
import React from 'react';
import type { Node } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import './firebase'; // import and init
import { error } from './util/general-util';
import { store } from './store/store';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import WindowSizeProvider from './components/Util/Responsive/WindowSizeProvider';
import './util/ga-util';

const appRenderer = (): Node => <ReactReduxProvider store={store}><App /></ReactReduxProvider>;

ReactDOM.render((
  <WindowSizeProvider>
    <LoginBarrier appRenderer={appRenderer} />
  </WindowSizeProvider>
), document.getElementById('root') ?? error('The root node is not found!'));
