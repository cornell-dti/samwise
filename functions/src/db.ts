import * as admin from 'firebase-admin';
import Database from 'common/lib/firebase/database';
import serviceAccount from './firebase-adminsdk.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://samwise-dev.firebaseio.com',
});

const database = new Database(() => admin.firestore());
export default database;
