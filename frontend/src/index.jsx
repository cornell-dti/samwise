/* eslint-disable react/jsx-filename-extension */
// @flow strict

import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.non-module.css';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import './firebase'; // import and init
import { error } from './util/general-util';
import { store } from './store/store';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import './util/ga-util';

const appRenderer = () => <ReactReduxProvider store={store}><App /></ReactReduxProvider>;

ReactDOM.render(
  <LoginBarrier appRenderer={appRenderer} />,
  document.getElementById('root') ?? error('The root node is not found!'),
);
