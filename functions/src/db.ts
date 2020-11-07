import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import Database from 'common/firebase/database';

if (process.env.TEST_MODE) {
  // eslint-disable-next-line no-console
  console.log('We are in test mode. Skip initializing firebase-admin.');
} else if (process.env.DEV) {
  admin.initializeApp({
    credential: JSON.parse(readFileSync('./firebase-adminsdk.json').toString()),
    databaseURL: 'https://samwise-dev.firebaseio.com',
  });
} else {
  admin.initializeApp();
}

const database = new Database(() => admin.firestore());
export default database;
