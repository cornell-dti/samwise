// @flow strict

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { firebaseUserPromise, firebaseInit } from './util/firebase-util';
import Loading from './components/UI/Loading';

firebaseInit();

const root = document.getElementById('root');
if (root == null) {
  throw new Error('The root node is not found!');
}

ReactDOM.render(<Loading />, root);
(async () => {
  const user = await firebaseUserPromise();
  ReactDOM.render(<App />, root);
})();
