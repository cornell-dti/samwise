import 'firebase/firestore';
import * as admin from 'firebase-admin';
import serviceAccount from './firebase-adminsdk.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: 'https://samwise-dev.firebaseio.com',
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
  BANNER_MESSAGE: 'samwise-banner-message',
  TAGS: 'samwise-tags',
  TASKS: 'samwise-tasks',
  SUBTASKS: 'samwise-subtasks',
};

type Collection = admin.firestore.CollectionReference;

export const orderManagerCollection = (): Collection => db().collection(collections.ORDER_MANAGER);
export const settingsCollection = (): Collection => db().collection(collections.USER_SETTINGS);
export const bannerMessageStatusCollection = (): Collection => db().collection(
  collections.BANNER_MESSAGE,
);
export const tagsCollection = (): Collection => db().collection(collections.TAGS);
export const tasksCollection = (): Collection => db().collection(collections.TASKS);
export const subTasksCollection = (): Collection => db().collection(collections.SUBTASKS);
