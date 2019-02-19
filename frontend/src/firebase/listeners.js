// @flow strict

import { tagsCollection, tasksCollection } from './db';
import { getAppUser } from './auth';
import type { FirestoreSubTask, FirestoreTag, FirestoreTask } from './firestore-types';
import type {
  Course, SubTask, Tag, Task,
} from '../store/store-types';
// $FlowFixMe
import coursesJson from '../assets/json/sp19-courses-with-exams-min.json';
import buildCoursesMap from '../util/courses-util';

type Listeners = {|
  +onTagsUpdate: (Tag[]) => void;
  +onTasksUpdate: (Task[]) => void;
  +onCourseMapFetched: (Map<number, Course[]>) => void;
  +onFirstFetched: () => void;
|};

function sortByOrder<-T: { +order: number }>(arr: T[]): T[] {
  return arr.sort((a, b) => a.order - b.order);
}

/**
 * Initialize listeners bind to firestore.
 */
export default (listeners: Listeners): (() => void) => {
  const {
    onTagsUpdate, onTasksUpdate, onCourseMapFetched, onFirstFetched,
  } = listeners;

  let firstTagsFetched = false;
  let firstTasksFetched = false;
  let courseJsonFetched = false;
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
    if (firstTagsFetched && firstTasksFetched && courseJsonFetched) {
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
          type, owner, date: timestamp, ...rest
        }: FirestoreTask = firestoreTaskOrSubTask;
        const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
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
    if (firstTagsFetched && firstTasksFetched && courseJsonFetched) {
      onFirstFetched();
    }
  });

  fetch(coursesJson).then(resp => resp.json()).then(buildCoursesMap).then((courseMap) => {
    onCourseMapFetched(courseMap);
    courseJsonFetched = true;
    if (firstTagsFetched && firstTasksFetched && courseJsonFetched) {
      onFirstFetched();
    }
  });

  return () => {
    // Suppressed because it's likely that this block of code will never be run.
    // eslint-disable-next-line no-console
    console.log('Unmounting Listeners... This should only happen when app dies!');
    unmountTagsListener();
    unmountTasksListener();
  };
};
