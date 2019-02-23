// @flow strict

import type { DocumentSnapshot } from 'firebase/firestore';
import { Set } from 'immutable';
import { subTasksCollection, tagsCollection, tasksCollection } from './db';
import { getAppUser } from './auth';
import type { FirestoreSubTask, FirestoreTag, FirestoreTask } from './firestore-types';
import type { SubTask, Tag, Task } from '../store/store-types';
import {
  patchCourses,
  patchSubTasks,
  patchTags,
  patchTasks,
} from '../store/actions';
// $FlowFixMe
import coursesJson from '../assets/json/sp19-courses-with-exams-min.json';
import buildCoursesMap from '../util/courses-util';

/**
 * Initialize listeners bind to firestore.
 */
export default (onFirstFetched: () => void): (() => void) => {
  let firstTagsFetched = false;
  let firstTasksFetched = false;
  let firstSubTasksFetched = false;
  let courseJsonFetched = false;
  const allFetched = () => firstTagsFetched && firstTasksFetched
    && firstSubTasksFetched && courseJsonFetched;
  const ownerEmail = getAppUser().email;

  const unmountTagsListener = tagsCollection().where('owner', '==', ownerEmail)
    .onSnapshot((s) => {
      const created = [];
      const edited = [];
      const deleted = [];
      s.docChanges().forEach((change) => {
        const doc: DocumentSnapshot = change.doc;
        const { id } = doc;
        if (change.type === 'removed') {
          deleted.push(id);
        } else {
          const { owner, ...rest }: FirestoreTag = doc.data();
          const tag: Tag = { id, ...rest };
          if (change.type === 'added') {
            created.push(tag);
          } else {
            edited.push(tag);
          }
        }
      });
      patchTags(created, edited, deleted);
      firstTagsFetched = true;
      if (allFetched()) {
        onFirstFetched();
      }
    });

  const unmountTasksListener = tasksCollection().where('owner', '==', ownerEmail)
    .onSnapshot((s) => {
      const created = [];
      const edited = [];
      const deleted = [];
      s.docChanges().forEach((change) => {
        const doc: DocumentSnapshot = change.doc;
        const { id } = doc;
        if (change.type === 'removed') {
          deleted.push(id);
        } else {
          const {
            owner, date, children, ...rest
          }: FirestoreTask = doc.data();
          const task: Task = {
            id,
            date: date instanceof Date ? date : date.toDate(),
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
      patchTasks(created, edited, deleted);
      firstTasksFetched = true;
      if (allFetched()) {
        onFirstFetched();
      }
    });

  const unmountSubTasksListener = subTasksCollection().where('owner', '==', ownerEmail)
    .onSnapshot((s) => {
      const created = [];
      const edited = [];
      const deleted = [];
      s.docChanges().forEach((change) => {
        const doc: DocumentSnapshot = change.doc;
        const { id } = doc;
        if (change.type === 'removed') {
          deleted.push(id);
        } else {
          const { owner, ...rest }: FirestoreSubTask = doc.data();
          const subTask: SubTask = { id, ...rest };
          if (change.type === 'added') {
            created.push(subTask);
          } else {
            edited.push(subTask);
          }
        }
      });
      patchSubTasks(created, edited, deleted);
      firstSubTasksFetched = true;
      if (allFetched()) {
        onFirstFetched();
      }
    });

  fetch(coursesJson).then(resp => resp.json()).then(buildCoursesMap).then((courseMap) => {
    patchCourses(courseMap);
    courseJsonFetched = true;
    if (allFetched()) {
      onFirstFetched();
    }
  });

  return () => {
    // Suppressed because it's likely that this block of code will never be run.
    // eslint-disable-next-line no-console
    console.log('Unmounting Listeners... This should only happen when app dies!');
    unmountTagsListener();
    unmountTasksListener();
    unmountSubTasksListener();
  };
};
