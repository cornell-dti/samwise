import * as admin from 'firebase-admin';
import Database from 'common/lib/firebase/database';
import serviceAccount from './firebase-adminsdk.json';

if (process.env.TEST_MODE) {
  // eslint-disable-next-line no-console
  console.log('We are in test mode. Skip initializing firebase-admin.');
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: 'https://samwise-dev.firebaseio.com',
  });
}

const database = new Database(() => admin.firestore());
export default database;
