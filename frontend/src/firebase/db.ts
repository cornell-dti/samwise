import firebase from 'firebase/app';
import 'firebase/firestore';

/**
 * The firestore database.
 * @return {firebase.firestore.Firestore}
 */
export const db = (): firebase.firestore.Firestore => firebase.firestore();

/**
 * Collection name literals.
 */
const collections = {
  ORDER_MANAGER: 'samwise-order-manager',
  USER_SETTINGS: 'samwise-settings',
  TAGS: 'samwise-tags',
  TASKS: 'samwise-tasks',
  SUBTASKS: 'samwise-subtasks',
};

type Collection = firebase.firestore.CollectionReference;

export const orderManagerCollection = (): Collection => db().collection(collections.ORDER_MANAGER);
export const settingsCollection = (): Collection => db().collection(collections.USER_SETTINGS);
export const tagsCollection = (): Collection => db().collection(collections.TAGS);
export const tasksCollection = (): Collection => db().collection(collections.TASKS);
export const subTasksCollection = (): Collection => db().collection(collections.SUBTASKS);
