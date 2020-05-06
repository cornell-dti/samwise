import { Set } from 'immutable';
import { TaskWithChildrenId } from 'common/lib/types/action-types';
import {
  SubTask,
  Tag,
  Settings,
  BannerMessageStatus,
  RepeatingTaskMetadata,
  Course,
  Group,
} from 'common/lib/types/store-types';
import buildCoursesMap from 'common/lib/util/courses-util';
import { ignore } from 'common/lib/util/general-util';
import { FirestoreSubTask, FirestoreTag, FirestoreTask } from 'common/lib/types/firestore-types';
import { QuerySnapshot, DocumentSnapshot } from 'common/lib/firebase/database';
import { database } from './db';
import { getAppUser } from './auth-util';
import {
  patchCourses,
  patchSettings,
  patchSubTasks,
  patchTags,
  patchTasks,
  patchBannerMessageStatus,
  patchGroups,
} from '../store/actions';
import coursesJson from '../assets/json/sp20-courses-with-exams-min.json';
import { store } from '../store/store';

// Some type alias
type Timestamp = firebase.firestore.Timestamp;

type UnmountCallback = () => void;
const listenTagsChange = (
  email: string,
  listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => database.tagsCollection()
  .where('owner', '==', email)
  .onSnapshot(listener);
const listenTasksChange = (
  email: string,
  listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => database.tasksCollection()
  .where('owner', '==', email)
  .onSnapshot(listener);
const listenSubTasksChange = (
  email: string,
  listener: (snapshot: QuerySnapshot) => void,
): UnmountCallback => database.subTasksCollection()
  .where('owner', '==', email)
  .onSnapshot(listener);
const listenSettingsChange = (
  email: string,
  listener: (snapshot: DocumentSnapshot) => void,
): UnmountCallback => database.settingsCollection()
  .doc(email)
  .onSnapshot(listener);
const listenBannerMessageChange = (
  email: string,
  listener: (snapshot: DocumentSnapshot) => void,
): UnmountCallback => database.bannerMessageStatusCollection()
  .doc(email)
  .onSnapshot(listener);
const listenGroupChange = (
  email: string,
  listener: (snapshot: DocumentSnapshot) => void,
): UnmountCallback => database.groupCollection()
  .whereArrayContains('members', email)
  .onSnapshot(listener);

const transformDate = (dateOrTimestamp: Date | Timestamp): Date => (
  dateOrTimestamp instanceof Date ? dateOrTimestamp : dateOrTimestamp.toDate()
);

/**
 * Initialize listeners bind to firestore.
 */
export default (onFirstFetched: () => void): (() => void) => {
  let firstTagsFetched = false;
  let firstTasksFetched = false;
  let firstSubTasksFetched = false;
  let firstSettingsFetched = false;
  let firstBannerStatusFetched = false;
  let firstGroupsFetched = false;
  const reportFirstFetchedIfAllFetched = (): void => {
    if (
      firstTagsFetched
      && firstTasksFetched
      && firstSubTasksFetched
      && firstSettingsFetched
      && firstBannerStatusFetched
      && firstGroupsFetched
    ) {
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
    const created: TaskWithChildrenId[] = [];
    const edited: TaskWithChildrenId[] = [];
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
        const { owner, children: childrenArr, ...rest } = data as FirestoreTask;
        const children = Set(childrenArr);
        const taskCommon = { id, children: children.toArray() };
        let task: TaskWithChildrenId;
        if (rest.type === 'ONE_TIME') {
          const { type, date: timestamp, icalUID, ...oneTimeTaskRest } = rest;
          const date = transformDate(timestamp);
          task = { ...taskCommon, ...oneTimeTaskRest, metadata: { type: 'ONE_TIME', date, icalUID } };
        } else if (rest.type === 'GROUP') {
          const { type, date: timestamp, group, ...groupTaskRest } = rest;
          const date = transformDate(timestamp);
          task = { ...taskCommon, ...groupTaskRest, metadata: { type: 'GROUP', date, group } };
        } else {
          const { type, forks: firestoreForks, date: firestoreRepeats, ...otherTaskProps } = rest;
          const forks = firestoreForks.map((firestoreFork) => ({
            forkId: firestoreFork.forkId,
            replaceDate: transformDate(firestoreFork.replaceDate),
          }));
          const startDate = transformDate(firestoreRepeats.startDate);
          let endDate: Date | number;
          if (typeof firestoreRepeats.endDate === 'number') {
            // eslint-disable-next-line prefer-destructuring
            endDate = firestoreRepeats.endDate;
          } else {
            endDate = transformDate(firestoreRepeats.endDate);
          }
          const metadata: RepeatingTaskMetadata = {
            type: 'MASTER_TEMPLATE',
            date: { startDate, endDate, pattern: firestoreRepeats.pattern },
            forks,
          };
          task = { ...taskCommon, ...otherTaskProps, metadata };
        }
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
      const newSettings: Settings = {
        canvasCalendar: null,
        completedOnboarding: false,
        theme: 'light',
      };
      database.settingsCollection()
        .doc(ownerEmail)
        .set(newSettings)
        .then(ignore);
      return;
    }
    const data = snapshot.data();
    if (data === undefined) {
      return;
    }
    const { canvasCalendar, completedOnboarding, theme } = data as Settings;
    store.dispatch(patchSettings({ canvasCalendar, completedOnboarding, theme }));
    firstSettingsFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  const unmountBannerStatusListener = listenBannerMessageChange(ownerEmail, (snapshot) => {
    const data = snapshot.exists ? snapshot.data() : undefined;
    const bannerMessageStatus = (data as BannerMessageStatus) ?? {};
    store.dispatch(patchBannerMessageStatus(bannerMessageStatus));
    firstBannerStatusFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  const unmountGroupsListener = listenGroupChange(ownerEmail, (snapshot) => {
    const data = snapshot.exists ? snapshot.data() : undefined;
    const groups = (data as Group[]) ?? [];
    store.dispatch(patchGroups(groups));
    firstGroupsFetched = true;
    reportFirstFetchedIfAllFetched();
  });

  store.dispatch(patchCourses(buildCoursesMap(coursesJson as Course[])));

  return () => {
    // Suppressed because it's likely that this block of code will never be run.
    // eslint-disable-next-line no-console
    console.log('Unmounting Listeners... This should only happen when app dies!');
    unmountTagsListener();
    unmountTasksListener();
    unmountSubTasksListener();
    unmountSettingsListener();
    unmountBannerStatusListener();
    unmountGroupsListener();
  };
};
