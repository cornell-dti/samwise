import firebase from 'firebase/app';
import 'firebase/functions';

let firebaseConfig: Record<string, string>;

if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_IS_STAGING !== 'true') {
  firebaseConfig = {
    apiKey: 'AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc',
    authDomain: 'dti-samwise.firebaseapp.com',
    databaseURL: 'https://dti-samwise.firebaseio.com',
    projectId: 'dti-samwise',
    storageBucket: 'dti-samwise.appspot.com',
    messagingSenderId: '114434220691',
    appId: '1:114434220691:web:01579d764b20fb0aeb6366',
    measurementId: 'G-DHQY39TSMH',
  };
} else {
  firebaseConfig = {
    apiKey: 'AIzaSyBJ0ElrYrw-fAQWWUEiRlf1wF38DswRduE',
    authDomain: 'samwise-dev.firebaseapp.com',
    databaseURL: 'https://samwise-dev.firebaseio.com',
    projectId: 'samwise-dev',
    storageBucket: 'samwise-dev.appspot.com',
    messagingSenderId: '423488925083',
    appId: '1:423488925083:web:6de3b7dd7df2c20c14453e',
    measurementId: 'G-ETTT5Z748X',
  };
}

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
