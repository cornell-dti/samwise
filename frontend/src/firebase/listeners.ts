import { Map, Set } from 'immutable';
import { subTasksCollection, tagsCollection, tasksCollection, settingsCollection } from './db';
import { getAppUser } from './auth';
import { FirestoreSubTask, FirestoreTag, FirestoreTask } from './firestore-types';
import { Course, SubTask, Tag, Task, Settings } from '../store/store-types';
import {
  patchCourses,
  patchSettings,
  patchSubTasks,
  patchTags,
  patchTasks,
} from '../store/actions';
// @ts-ignore
import coursesJson from '../assets/json/sp19-courses-with-exams-min.json';
import buildCoursesMap from '../util/courses-util';
import { store } from '../store/store';
import { ignore } from '../util/general-util';

// Some type alias
type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
type QuerySnapshot = firebase.firestore.QuerySnapshot;

type UnmountCallback = () => void;
const listenTagsChange = (
  email: string, listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => tagsCollection().where('owner', '==', email).onSnapshot(listener);
const listenTasksChange = (
  email: string, listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => tasksCollection().where('owner', '==', email).onSnapshot(listener);
const listenSubTasksChange = (
  email: string, listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => subTasksCollection().where('owner', '==', email).onSnapshot(listener);
const listenSettingsChange = (
  email: string, listener: (snapshot: DocumentSnapshot) => void,
): UnmountCallback => settingsCollection().doc(email).onSnapshot(listener);

/**
 * Initialize listeners bind to firestore.
 */
export default (onFirstFetched: () => void): (() => void) => {
  let firstTagsFetched = false;
  let firstTasksFetched = false;
  let firstSubTasksFetched = false;
  let firstSettingsFetched = false;
  let courseJsonFetched = false;
  const reportFirstFetchedIfAllFetched = (): void => {
    if (firstTagsFetched
      && firstTasksFetched
      && firstSubTasksFetched
      && firstSettingsFetched
      && courseJsonFetched) {
      onFirstFetched();
    }
  };
  const ownerEmail = getAppUser().email;

  const unmountTagsListener = listenTagsChange(ownerEmail, (snapshot) => {
    const created: Tag[] = [];
    const edited: Tag[] = [];
    const deleted: string[] = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        const data = doc.data();
        if (data === undefined) {
          return;
        }
        const { owner, ...rest } = data as FirestoreTag;
        const tag: Tag = { id, ...rest };
        if (change.type === 'added') {
          created.push(tag);
        } else {
          edited.push(tag);
        }
      }
    });
    store.dispatch(patchTags(created, edited, deleted));
    firstTagsFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  const unmountTasksListener = listenTasksChange(ownerEmail, (snapshot) => {
    const created: Task[] = [];
    const edited: Task[] = [];
    const deleted: string[] = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        const data = doc.data();
        if (data === undefined) {
          return;
        }
        const { owner, date: timestamp, children, ...rest } = data as FirestoreTask;
        const task: Task = {
          id,
          date: timestamp instanceof Date ? timestamp : timestamp.toDate(),
          children: Set(children),
          ...rest,
        };
        if (change.type === 'added') {
          created.push(task);
        } else {
          edited.push(task);
        }
      }
    });
    store.dispatch(patchTasks(created, edited, deleted));
    firstTasksFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  const unmountSubTasksListener = listenSubTasksChange(ownerEmail, (snapshot) => {
    const created: SubTask[] = [];
    const edited: SubTask[] = [];
    const deleted: string[] = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        const data = doc.data();
        if (data === undefined) {
          return;
        }
        const { owner, ...rest } = data as FirestoreSubTask;
        const subTask: SubTask = { id, ...rest };
        if (change.type === 'added') {
          created.push(subTask);
        } else {
          edited.push(subTask);
        }
      }
    });
    store.dispatch(patchSubTasks(created, edited, deleted));
    firstSubTasksFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  const unmountSettingsListener = listenSettingsChange(ownerEmail, (snapshot) => {
    if (!snapshot.exists) {
      const newSettings: Settings = { completedOnboarding: false, theme: 'light' };
      settingsCollection().doc(ownerEmail).set(newSettings).then(ignore);
      return;
    }
    const data = snapshot.data();
    if (data === undefined) {
      return;
    }
    const { completedOnboarding, theme } = data as Settings;
    store.dispatch(patchSettings({ completedOnboarding, theme }));
    firstSettingsFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  // @ts-ignore ts cannot decide that this imported json is resolved into a string.
  fetch(coursesJson)
    .then((resp: Response) => resp.json())
    .then(buildCoursesMap).then((courseMap: Map<string, Course[]>) => {
      store.dispatch(patchCourses(courseMap));
      courseJsonFetched = true;
      reportFirstFetchedIfAllFetched();
    });

  return () => {
    // Suppressed because it's likely that this block of code will never be run.
    // eslint-disable-next-line no-console
    console.log('Unmounting Listeners... This should only happen when app dies!');
    unmountTagsListener();
    unmountTasksListener();
    unmountSubTasksListener();
    unmountSettingsListener();
  };
};
