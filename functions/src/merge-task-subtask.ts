import { FirestoreCommonTask, FirestoreSubTask } from 'common/types/firestore-types';
import { Map } from 'immutable';
import { partition } from './util';
import database from './db';

type TaskUpdateData = { id: string; subtasks: FirestoreSubTask[] };

type OldFirestoreSubTask = {
  complete: boolean;
  inFocus: boolean;
  name: string;
  order: number;
  owner: string;
};

type NewSubTask = {
  complete: boolean;
  inFocus: boolean;
  name: string;
  order: number;
};

const mergeSubtaskTask = async (): Promise<void> => {
  const tasksSnapshot = await database.tasksCollection().get();
  const subTasksSnapshot = await database.subTasksCollection().get();
  // Initialize map from subtask ID to FirestoreCommonTask representing its data
  let subTaskMap: Map<string, OldFirestoreSubTask> = Map();

  // Populate map for constant time retrieval of subtasks by ID
  subTasksSnapshot.forEach((document) => {
    const data = document.data();
    const subTask = data as OldFirestoreSubTask;
    subTaskMap = subTaskMap.set(document.id, subTask);
  });

  const idListToUpdate: TaskUpdateData[] = [];
  tasksSnapshot.docs.forEach((document) => {
    const { id } = document;
    const data = document.data();
    if (data != null) {
      const task = data as FirestoreCommonTask;
      const { children } = task;
      const subtasks: NewSubTask[] = [];
      if (children !== undefined && children.length !== 0) {
        children.forEach((subtaskId) => {
          const subtask = subTaskMap.get(subtaskId);
          if (subtask !== undefined) {
            const { complete, inFocus, name, order } = subtask;
            subtasks.push({ complete, inFocus, name, order });
          }
        });
      }
      idListToUpdate.push({ id, subtasks });
    }
  });
  // Used to overcome to the 500 item per batch limit.
  const partitioned = partition<TaskUpdateData>(idListToUpdate, 500);
  // eslint-disable-next-line no-restricted-syntax
  for (const idOwnerList of partitioned) {
    const batch = database.db().batch();
    idOwnerList.forEach(({ id, subtasks }) =>
      batch.update(database.tasksCollection().doc(id), {
        children: subtasks,
      })
    );
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
  }
};

export default mergeSubtaskTask;
