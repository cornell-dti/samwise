// @flow strict

import firebase from 'firebase/app';

let firebaseConfig: object;

if (process.env.NODE_ENV === 'production' && process.env.IS_STAGING !== 'true') {
  firebaseConfig = {
    apiKey: 'AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc',
    authDomain: 'dti-samwise.firebaseapp.com',
    databaseURL: 'https://dti-samwise.firebaseio.com',
    projectId: 'dti-samwise',
    storageBucket: 'dti-samwise.appspot.com',
    messagingSenderId: '114434220691',
  };
} else {
  firebaseConfig = {
    apiKey: 'AIzaSyBJ0ElrYrw-fAQWWUEiRlf1wF38DswRduE',
    authDomain: 'samwise-dev.firebaseapp.com',
    databaseURL: 'https://samwise-dev.firebaseio.com',
    projectId: 'samwise-dev',
    storageBucket: 'samwise-dev.appspot.com',
    messagingSenderId: '423488925083',
  };
}

firebase.initializeApp(firebaseConfig);
