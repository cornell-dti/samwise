// @flow strict

import { Set } from 'immutable';
import type { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { subTasksCollection, tagsCollection, tasksCollection, settingsCollection } from './db';
import { getAppUser } from './auth';
import type {
  FirestoreSubTask,
  FirestoreTag,
  FirestoreTask,
} from './firestore-types';
import type { SubTask, Tag, Task, Settings } from '../store/store-types';
import {
  patchCourses, patchSettings,
  patchSubTasks,
  patchTags,
  patchTasks,
} from '../store/actions';
// $FlowFixMe
import coursesJson from '../assets/json/sp19-courses-with-exams-min.json';
import buildCoursesMap from '../util/courses-util';
import { store } from '../store/store';
import { ignore } from '../util/general-util';

type UnmountCallback = () => void;
const listenTagsChange = (
  email: string, listener: (QuerySnapshot) => void,
): UnmountCallback => tagsCollection().where('owner', '==', email).onSnapshot(listener);
const listenTasksChange = (
  email: string, listener: (QuerySnapshot) => void,
): UnmountCallback => tasksCollection().where('owner', '==', email).onSnapshot(listener);
const listenSubTasksChange = (
  email: string, listener: (QuerySnapshot) => void,
): UnmountCallback => subTasksCollection().where('owner', '==', email).onSnapshot(listener);
const listenSettingsChange = (
  email: string, listener: (DocumentSnapshot) => void,
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
  const reportFirstFetchedIfAllFetched = () => {
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
    const created = [];
    const edited = [];
    const deleted = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        // $FlowFixMe
        const { owner, ...rest }: FirestoreTag = (doc.data(): any);
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
    const created = [];
    const edited = [];
    const deleted = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        // $FlowFixMe
        const { owner, date: timestamp, children, ...rest }: FirestoreTask = (doc.data(): any);
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
    const created = [];
    const edited = [];
    const deleted = [];
    snapshot.docChanges().forEach((change) => {
      const { doc } = change;
      const { id } = doc;
      if (change.type === 'removed') {
        deleted.push(id);
      } else {
        // $FlowFixMe
        const { owner, ...rest }: FirestoreSubTask = (doc.data(): any);
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
    const { completedOnboarding, theme }: Settings = snapshot.data();
    store.dispatch(patchSettings({ completedOnboarding, theme }));
    firstSettingsFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  fetch(coursesJson).then(resp => resp.json()).then(buildCoursesMap).then((courseMap) => {
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
