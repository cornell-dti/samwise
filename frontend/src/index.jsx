// @flow strict

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/index';
import styles from './index.css';
import App from './App';
import { firebaseUserPromise, firebaseInit } from './util/firebase-util';

firebaseInit();

const root = document.getElementById('root');
if (root == null) {
  throw new Error('The root node is not found!');
}

ReactDOM.render(
  (
    <div className={styles.LoadingTextWrapper}>
      <div className={styles.LoadingText}>Loading...</div>
    </div>
  ),
  root,
);
(async () => {
  const user = await firebaseUserPromise();
  ReactDOM.render(<Provider store={store}><App user={user} /></Provider>, root);
})();
