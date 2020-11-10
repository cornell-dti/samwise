import { partition } from './util';
import database from './db';

const N = 40;

const nDaysBeforeNow = (n: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
};

const removeOldTasks = async (): Promise<void> => {
  const cutoff = nDaysBeforeNow(N);
  const snapshot = await database.tasksCollection().where('date', '<', cutoff).get();
  const idListToDelete: string[] = [];
  snapshot.docs.forEach((document) => {
    const { id } = document;
    const data = document.data();
    if (data == null) {
      return idListToDelete.push(id);
    }
    return idListToDelete.push(id);
  });
  // Used to overcome to the 500 item per batch limit.
  const partitioned = partition(idListToDelete, 500);
  // eslint-disable-next-line no-restricted-syntax
  for (const idList of partitioned) {
    const batch = database.db().batch();
    idList.forEach((id) => batch.delete(database.tasksCollection().doc(id)));
    // We intentionally doing batches sequentially to rate limit our firestore usage.
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
  }
};

export default removeOldTasks;
