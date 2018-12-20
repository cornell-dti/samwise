// @flow strict

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { firebaseInit } from './util/firebase-util';
import { error } from './util/general-util';

firebaseInit();

const root = document.getElementById('root') ?? error('The root node is not found!');
ReactDOM.render(<App />, root);
