import { FirestoreCommonTask } from 'common/lib/types/firestore-types';
import database from './db';

const N = 40;

const nDaysBeforeNow = (n: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
};

// Visible for testing.
export const partition = (
  idList: readonly string[],
  partitionSize: number,
): readonly string[][] => {
  const partitioned: string[][] = [];
  let collector: string[] = [];
  idList.forEach((id) => {
    if (collector.length === partitionSize) {
      partitioned.push(collector);
      collector = [];
    }
    collector.push(id);
  });
  if (collector.length > 0) {
    partitioned.push(collector);
  }
  return partitioned;
};

export default async (): Promise<void> => {
  const cutoff = nDaysBeforeNow(N);
  const snapshot = await database
    .tasksCollection()
    .where('date', '<', cutoff)
    .get();
  const idListToDelete: string[] = [];
  snapshot.docs.forEach((document) => {
    const { id } = document;
    const data = document.data();
    if (data == null) {
      return idListToDelete.push(id);
    }
    return idListToDelete.push(id, ...(data as FirestoreCommonTask).children);
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
