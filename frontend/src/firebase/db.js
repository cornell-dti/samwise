// @flow strict

import firebase from 'firebase/app';
import 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

/**
 * The firestore database.
 * @return {firebase.firestore.Firestore}
 */
export const db = (): Firestore => firebase.firestore();

/**
 * Collection name literals.
 * @type {{TASKS: string, TAGS: string, SUBTASKS: string}}
 */
const collections = {
  ORDER_MANAGER: 'samwise-order-manager',
  TAGS: 'samwise-tags-experimental',
  TASKS: 'samwise-tasks-experimental',
  SUBTASKS: 'samwise-subtasks-experimental',
};

export const orderManagerCollection = () => db().collection(collections.ORDER_MANAGER);
export const tagsCollection = () => db().collection(collections.TAGS);
export const tasksCollection = () => db().collection(collections.TASKS);
export const subTasksCollection = () => db().collection(collections.SUBTASKS);
