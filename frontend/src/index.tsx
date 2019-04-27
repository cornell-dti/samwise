import '@babel/polyfill';
import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { Provider as ReactReduxProvider } from 'react-redux';
import App from './App';
import './firebase'; // import and init firebase
import { error } from './util/general-util';
import { store } from './store/store';
import ErrorBoundary from './components/Util/ErrorBoundary';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import './util/ga-util'; // import and init google analytics
import { initModal } from './components/Util/Modals';
import * as serviceWorker from './serviceWorker';

const appRenderer = (): ReactElement => (
  <ReactReduxProvider store={store}><App /></ReactReduxProvider>
);

const root = document.getElementById('root') || error('The root is null. This is bad!');
ReactDOM.render(<ErrorBoundary><LoginBarrier appRenderer={appRenderer} /></ErrorBoundary>, root);
initModal();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
