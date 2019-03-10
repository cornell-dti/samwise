import '@babel/polyfill';
import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './index.non-module.css';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import './firebase'; // import and init
import { error } from './util/general-util';
import { store } from './store/store';
import ErrorBoundary from './components/Util/ErrorBoundary';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import './util/ga-util';

const appRenderer = (): ReactElement => (
  <ReactReduxProvider store={store}><App /></ReactReduxProvider>
);

const root = document.getElementById('root');
if (root == null) {
  error('The root is null. This is bad!');
}
ReactDOM.render(<ErrorBoundary><LoginBarrier appRenderer={appRenderer} /></ErrorBoundary>, root);
