// @flow strict

import firebase from 'firebase/app';

if (process.env.NODE_ENV === 'production') {
  // TODO enable it again later
  /*
  firebase.initializeApp({
    apiKey: 'AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc',
    authDomain: 'dti-samwise.firebaseapp.com',
    databaseURL: 'https://dti-samwise.firebaseio.com',
    projectId: 'dti-samwise',
    storageBucket: 'dti-samwise.appspot.com',
    messagingSenderId: '114434220691',
  });
  */
  firebase.initializeApp({
    apiKey: 'AIzaSyBJ0ElrYrw-fAQWWUEiRlf1wF38DswRduE',
    authDomain: 'samwise-dev.firebaseapp.com',
    databaseURL: 'https://samwise-dev.firebaseio.com',
    projectId: 'samwise-dev',
    storageBucket: 'samwise-dev.appspot.com',
    messagingSenderId: '423488925083',
  });
} else {
  firebase.initializeApp({
    apiKey: 'AIzaSyBJ0ElrYrw-fAQWWUEiRlf1wF38DswRduE',
    authDomain: 'samwise-dev.firebaseapp.com',
    databaseURL: 'https://samwise-dev.firebaseio.com',
    projectId: 'samwise-dev',
    storageBucket: 'samwise-dev.appspot.com',
    messagingSenderId: '423488925083',
  });
}
