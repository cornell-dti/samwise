import React, { ReactElement } from 'react';
import { Provider as ReactReduxProvider } from '../store';
import App from '../App';
import '../firebase'; // import and init firebase
import ErrorBoundary from '../components/Util/ErrorBoundary';
import LoginBarrier from '../components/Util/AppInit/LoginBarrier';

const appRenderer = (): ReactElement => (
  <ReactReduxProvider>
    <App />
  </ReactReduxProvider>
);

const IndexPage = (): ReactElement => (
  <ErrorBoundary>
    <LoginBarrier appRenderer={appRenderer} />
  </ErrorBoundary>
);

export default IndexPage;
