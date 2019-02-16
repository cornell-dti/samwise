// @flow strict

import { tagsCollection, tasksCollection } from './db';
import { getAppUser } from './auth';
import type { FirestoreSubTask, FirestoreTag, FirestoreTask } from './firestore-types';
import type { SubTask, Tag, Task } from '../store/store-types';

type Listeners = {|
  +onTagsUpdate: (Tag[]) => void;
  +onTasksUpdate: (Task[]) => void;
  +onFirstFetched: () => void;
|};

function sortByOrder<-T: { +order: number }>(arr: T[]): T[] {
  return arr.sort((a, b) => a.order - b.order);
}

/**
 * Initialize listeners bind to firestore.
 *
 * @param {function(Tag[]): void} onTagsUpdate called when tags changed.
 * @param {function(Task[]): void} onTasksUpdate called when tasks changed.
 * @param {function(): void} onFirstFetched called when the first wave of data is fetched.
 * @return {function(): void} the handler to destroy the listeners.
 */
export default ({ onTagsUpdate, onTasksUpdate, onFirstFetched }: Listeners): (() => void) => {
  let firstTagsFetched = false;
  let firstTasksFetched = false;
  const ownerEmail = getAppUser().email;

  const unmountTagsListener = tagsCollection().where('owner', '==', ownerEmail).onSnapshot((s) => {
    const tags = s.docs.map((doc) => {
      const { id } = doc;
      const { owner, ...rest }: FirestoreTag = doc.data();
      return ({ id, ...rest }: Tag);
    });
    const sortedTags = tags.sort((a, b) => a.order - b.order);
    onTagsUpdate(sortedTags);
    firstTagsFetched = true;
    if (firstTagsFetched && firstTasksFetched) {
      onFirstFetched();
    }
  });

  const unmountTasksListener = tasksCollection().where('owner', '==', ownerEmail).onSnapshot((s) => {
    const mainTasksMap = new Map<string, Task>(); // key is task id
    const subTasksMap = new Map<string, SubTask[]>(); // key is parent id
    const len = s.docs.length;
    for (let i = 0; i < len; i += 1) {
      const doc = s.docs[i];
      const { id } = doc;
      const firestoreTaskOrSubTask: FirestoreTask | FirestoreSubTask = doc.data();
      if (firestoreTaskOrSubTask.type === 'TASK') {
        const {
          type, owner, date, ...rest
        }: FirestoreTask = firestoreTaskOrSubTask;
        const task: Task = {
          id, date, subtasks: [], ...rest,
        };
        mainTasksMap.set(id, task);
      } else {
        const {
          type, owner, parent, ...rest
        }: FirestoreSubTask = firestoreTaskOrSubTask;
        const subtask: SubTask = { id, ...rest };
        const arr = subTasksMap.get(parent) ?? [];
        arr.push(subtask);
        subTasksMap.set(parent, arr);
      }
    }
    subTasksMap.forEach((subtasks: SubTask[], parent: string) => {
      const mainTask = mainTasksMap.get(parent);
      if (mainTask == null) {
        return;
      }
      mainTasksMap.set(parent, { ...mainTask, subtasks: sortByOrder(subtasks) });
    });
    const tasks: Task[] = [];
    mainTasksMap.forEach((task: Task) => { tasks.push(task); });
    onTasksUpdate(sortByOrder(tasks));
    firstTasksFetched = true;
    if (firstTagsFetched && firstTasksFetched) {
      onFirstFetched();
    }
  });

  return () => {
    unmountTagsListener();
    unmountTasksListener();
  };
};
