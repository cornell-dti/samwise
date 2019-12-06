import * as admin from 'firebase-admin';
import serviceAccount from './firebase-adminsdk.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://samwise-dev.firebaseio.com'
});

/**
 * The firestore database.
 * @return {firebase.firestore.Firestore}
 */
export const db = (): admin.firestore.Firestore => admin.firestore();

/**
 * Collection name literals.
 */
const collections = {
  ORDER_MANAGER: 'samwise-order-manager',
  USER_SETTINGS: 'samwise-settings',
  TASKS: 'samwise-tasks'
};

type Collection = admin.firestore.CollectionReference;

export const orderManagerCollection = (): Collection => db().collection(collections.ORDER_MANAGER);
export const settingsCollection = (): Collection => db().collection(collections.USER_SETTINGS);
export const tasksCollection = (): Collection => db().collection(collections.TASKS);
