import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import {
  FirestoreTag,
  FirestoreTask,
  FirestoreSubTask,
  UserActionRecord,
  UserActionStat
} from './types';

const TAG_DOC = 'samwise-tags/{tagId}';
const TASK_DOC = 'samwise-tasks/{taskId}';

const userActions = () => firestore().collection('samwise-user-actions');

const getTime = (context: functions.EventContext): firestore.Timestamp => {
  const d = new Date(context.timestamp);
  d.setUTCMinutes(0, 0, 0);
  return firestore.Timestamp.fromDate(d);
};

const getUserActionQuery = (user: string, time: firestore.Timestamp): firestore.Query => {
  let q: firestore.Query = userActions();
  q = q.where('user', '==', user);
  q = q.where('time', '==', time);
  return q;
};

const emptyActions: UserActionStat = {
  createTag: 0,
  editTag: 0,
  deleteTag: 0,
  createTask: 0,
  createSubTask: 0,
  deleteTask: 0,
  deleteSubTask: 0,
  editTask: 0,
  completeTask: 0,
  focusTask: 0,
  completeFocusedTask: 0
};

const updateRecord = (
  user: string, context: functions.EventContext,
  getNewActionStat: () => UserActionStat,
  updateActionStat: (actions: UserActionStat) => UserActionStat
): void => {
  const time = getTime(context);
  firestore().runTransaction(async (transaction) => {
    const querySnapshot = await transaction.get(getUserActionQuery(user, time));
    if (querySnapshot.size === 0) {
      const record: UserActionRecord = { user, time, actions: getNewActionStat() };
      transaction.create(userActions().doc(), record);
    } else {
      const existingDoc = querySnapshot.docs[0];
      const existingRecord = existingDoc.data() as UserActionRecord;
      const actions: UserActionStat = updateActionStat(existingRecord.actions);
      transaction.update(userActions().doc(existingDoc.id), { actions });
    }
  });
};

export const tagsOnCreate = functions.firestore.document(TAG_DOC)
  .onCreate((snapshot, context) => {
    const { owner } = snapshot.data() as FirestoreTag;
    updateRecord(
      owner,
      context,
      () => ({ ...emptyActions, createTag: 1 }),
      (actions) => ({ ...actions, createTag: actions.createTag + 1 })
    );
  });

export const tagsOnUpdate = functions.firestore.document(TAG_DOC)
  .onUpdate((snapshot, context) => {
    const { after } = snapshot;
    if (after === undefined) {
      return;
    }
    const { owner } = after.data() as FirestoreTag;
    updateRecord(
      owner,
      context,
      () => ({ ...emptyActions, editTag: 1 }),
      (actions) => ({ ...actions, editTag: actions.editTag + 1 })
    );
  });

export const tagsOnDelete = functions.firestore.document(TAG_DOC)
  .onDelete((snapshot, context) => {
    const { owner } = snapshot.data() as FirestoreTag;
    updateRecord(
      owner,
      context,
      () => ({ ...emptyActions, deleteTag: 1 }),
      (actions) => ({ ...actions, deleteTag: actions.deleteTag + 1 })
    );
  });

export const tasksOnCreate = functions.firestore.document(TASK_DOC)
  .onCreate((snapshot, context) => {
    const { owner, type } = snapshot.data() as (FirestoreTask | FirestoreSubTask);
    updateRecord(
      owner,
      context,
      () => (
        type === 'TASK'
          ? { ...emptyActions, createTask: 1 }
          : { ...emptyActions, createSubTask: 1 }
      ),
      (actions) => (
        type === 'TASK'
          ? { ...actions, createTask: actions.createTask + 1 }
          : { ...actions, createSubTask: actions.createSubTask + 1 }
      )
    );
  });

export const tasksOnUpdate = functions.firestore.document(TASK_DOC)
  .onUpdate((snapshot, context) => {
    const { before, after } = snapshot;
    if (before === undefined || after === undefined) {
      return;
    }
    const beforeData = before.data() as (FirestoreTask | FirestoreSubTask);
    const afterData = after.data() as (FirestoreTask | FirestoreSubTask);
    const user = afterData.owner;
    let editTaskIncrease = 0;
    let completeTaskIncrease = 0;
    let focusTaskIncrease = 0;
    let completeFocusedTaskIncrease = 0;
    if (afterData.name !== beforeData.name) {
      editTaskIncrease = 1;
    } else if (afterData.type === 'TASK') {
      const { date, tag } = afterData;
      const beforeTask = beforeData as FirestoreTask;
      if (!date.isEqual(beforeTask.date) || tag !== beforeTask.tag) {
        editTaskIncrease = 1;
      }
    }
    if (!beforeData.complete && afterData.complete) {
      completeTaskIncrease = 1;
    }
    if (!beforeData.inFocus && afterData.inFocus) {
      focusTaskIncrease = 1;
    }
    if (beforeData.inFocus && afterData.inFocus && !beforeData.complete && afterData.complete) {
      completeFocusedTaskIncrease = 1;
    }
    updateRecord(
      user,
      context,
      () => ({
        ...emptyActions,
        editTask: editTaskIncrease,
        completeTask: completeTaskIncrease,
        focusTask: focusTaskIncrease,
        completeFocusedTask: completeFocusedTaskIncrease
      }),
      (actions) => ({
        ...actions,
        editTask: actions.editTask + editTaskIncrease,
        completeTask: actions.completeTask + completeTaskIncrease,
        focusTask: actions.focusTask + focusTaskIncrease,
        completeFocusedTask: actions.completeFocusedTask + completeFocusedTaskIncrease
      })
    )
  });

export const tasksOnDelete = functions.firestore.document(TASK_DOC)
  .onDelete((snapshot, context) => {
    const { owner, type } = snapshot.data() as (FirestoreTask | FirestoreSubTask);
    updateRecord(
      owner,
      context,
      () => (
        type === 'TASK'
          ? { ...emptyActions, deleteTask: 1 }
          : { ...emptyActions, deleteSubTask: 1 }
      ),
      (actions) => (
        type === 'TASK'
          ? { ...actions, deleteTask: actions.deleteTask + 1 }
          : { ...actions, deleteSubTask: actions.deleteSubTask + 1 }
      )
    );
  });
