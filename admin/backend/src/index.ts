import express from 'express';
import admin, { firestore } from 'firebase-admin';
import serviceAccount from '../secret/dti-samwise-firebase-adminsdk.json';
import { UserActionRecord, UserActionStat } from './types.js';
import { stringify } from 'querystring';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as object),
  databaseURL: 'https://dti-samwise.firebaseio.com',
});

const db = admin.firestore();
const app = express();

const STAT_COLLECTION = 'samwise-user-actions';

app.get('/api/', (_, res) => {
  res.send('Hello TS.');
});

app.get('/api/raw-data', async (_, res) => {
  const allDocs = await db.collection(STAT_COLLECTION).get().then((s) => s.docs);
  const allDataJson = allDocs.map((doc) => doc.data() as UserActionRecord);
  res.status(200).send(allDataJson);
});

/**
 * @param time the time to convert.
 * @returns the time string.
 */
function getTimeString(time: firestore.Timestamp): string {
  return time.toDate().toISOString();
}

/**
 * @param a1 the first action stat.
 * @param a2 the second action stat.
 * @returns the merged action stat.
 */
function mergeActions(a1: UserActionStat, a2: UserActionStat): UserActionStat {
  return {
    createTag: a1.createTag + a2.createTag,
    editTag: a1.editTag + a2.editTag,
    deleteTag: a1.deleteTag + a2.deleteTag,
    createTask: a1.createTask + a2.createTask,
    createSubTask: a1.createSubTask + a2.createSubTask,
    deleteTask: a1.deleteTask + a2.deleteTask,
    deleteSubTask: a1.deleteSubTask + a2.deleteSubTask,
    editTask: a1.editTask + a2.editTask,
    completeTask: a1.completeTask + a2.completeTask,
    focusTask: a1.focusTask + a2.focusTask,
    completeFocusedTask: a1.completeFocusedTask + a2.completeFocusedTask,
  };
}

app.get('/api/recent-stat', async (req, res) => {
  const { limit } = req.query;
  // default limit to 7 days
  const dayLimit = parseInt(limit == null ? '7' : limit, 10);
  const limitTime = new Date();
  limitTime.setHours(29, 59, 59); // first set the time to today's end
  limitTime.setDate(limitTime.getDate() - dayLimit); // then push back dates
  const allDocs = await db.collection(STAT_COLLECTION)
    .where('time', '>=', limitTime)
    .get()
    .then((s) => s.docs);
  const actionCollectionMap = new Map<string, UserActionStat>();
  allDocs.map((doc) => doc.data() as UserActionRecord)
    .forEach(({ time, actions }: UserActionRecord) => {
      const timeString = getTimeString(time);
      const prevActionAcc = actionCollectionMap.get(timeString);
      if (prevActionAcc === undefined) {
        actionCollectionMap.set(timeString, actions);
      } else {
        actionCollectionMap.set(timeString, mergeActions(actions, prevActionAcc));
      }
    });
  const unsortedActionCollection: Array<{ time: string, actions: UserActionStat }> = [];
  actionCollectionMap.forEach((actions, time) => {
    unsortedActionCollection.push({ time, actions });
  });
  const sortedActionCollection = unsortedActionCollection
    .sort((a, b) => -a.time.localeCompare(b.time));
  res.status(200).send(sortedActionCollection);
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
