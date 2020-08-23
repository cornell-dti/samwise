import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { error } from 'common/lib/util/general-util';
import { Provider as ReactReduxProvider } from './store';
import App from './App';
import './firebase'; // import and init firebase
import ErrorBoundary from './components/Util/ErrorBoundary';
import LoginBarrier from './components/Util/AppInit/LoginBarrier';
import { initialize as initializeGA } from './util/ga-util';
import { registerGateKeeper } from './util/gate-keeper';
import { initModal } from './components/Util/Modals';
import * as serviceWorker from './serviceWorker';

initializeGA();
registerGateKeeper();

const appRenderer = (): ReactElement => (
  <ReactReduxProvider>
    <App />
  </ReactReduxProvider>
);

const root = document.getElementById('root') ?? error('The root is null. This is bad!');
ReactDOM.render(
  <ErrorBoundary>
    <LoginBarrier appRenderer={appRenderer} />
  </ErrorBoundary>,
  root
);
initModal();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
