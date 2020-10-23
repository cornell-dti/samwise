import { FirestoreCommonTask } from 'common/types/firestore-types';
import { partition } from './util';
import database from './db';

type TaskUpdateData = { id: string; owner: string };

const migrateTaskOwners = async (): Promise<void> => {
  const snapshot = await database.tasksCollection().get();
  const idListToUpdate: TaskUpdateData[] = [];
  snapshot.docs.forEach((document) => {
    const { id } = document;
    const data = document.data();
    if (data != null) {
      const task = data as FirestoreCommonTask;
      const { children, owner } = task;
      idListToUpdate.push({
        id,
        owner,
      });
      if (children != null) {
        children.forEach((childId) =>
          idListToUpdate.push({
            id: childId,
            owner,
          })
        );
      }
    }
  });
  // Used to overcome to the 500 item per batch limit.
  const partitioned = partition<TaskUpdateData>(idListToUpdate, 500);
  // eslint-disable-next-line no-restricted-syntax
  for (const idOwnerList of partitioned) {
    const batch = database.db().batch();
    // Update all owner strings to singleton string arrays
    idOwnerList.forEach(({ id, owner }) =>
      batch.update(database.tasksCollection().doc(id), {
        owner: [owner],
      })
    );
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
  }
};

export default migrateTaskOwners;
