import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

const TAG_DOC = 'samwise-tags/{tagId}';
const TASK_DOC = 'samwise-tasks/{taskId}';

const tags = () => firestore().collection('samwise-tags');
const tasks = () => firestore().collection('samwise-tasks');
const activeUsers = () => firestore().collection('samwise-active-users');
const aggregationAnalytics = () => firestore().collection('samwise-aggregation-analytics');

export const tagsOnCreate = functions.firestore.document(TAG_DOC)
  .onCreate((snapshot, context) => {
    const eventTime = context.timestamp;
    const { owner }: FirestoreTag = snapshot.data();
    firestore().runTransaction(async (transaction) => {
      // transaction.get(/* ??? */)
    });
  });

export const tagsOnUpdate = functions.firestore.document(TAG_DOC)
  .onUpdate((snapshot, context) => {
    const eventTime = context.timestamp;
    const { before, after } = snapshot;
    if (before === undefined || after === undefined) {
      return;
    }
    const beforeData: FirestoreTag = before.data();
    const afterData: FirestoreTag = after.data();

  });

export const tagsOnDelete = functions.firestore.document(TAG_DOC)
  .onDelete((snapshot, context) => {
    const eventTime = context.timestamp;
    const data: FirestoreTag = snapshot.data();

  });

export const tasksOnCreate = functions.firestore.document(TASK_DOC)
  .onCreate((snapshot, context) => {
    const eventTime = context.timestamp;
    const data: FirestoreTask | FirestoreSubTask = snapshot.data();

  });

export const tasksOnUpdate = functions.firestore.document(TASK_DOC)
  .onUpdate((snapshot, context) => {
    const eventTime = context.timestamp;
    const { before, after } = snapshot;
    if (before === undefined || after === undefined) {
      return;
    }
    const beforeData: FirestoreTask | FirestoreSubTask = before.data();
    const afterData: FirestoreTask | FirestoreSubTask = after.data();

  });

export const tasksOnDelete = functions.firestore.document(TASK_DOC)
  .onDelete((snapshot, context) => {
    const eventTime = context.timestamp;
    const data: FirestoreTask | FirestoreSubTask = snapshot.data();

  });
