import { firestore } from 'firebase/app';
import { Map } from 'immutable';
import {
  Course,
  SubTask,
  Tag,
  Task,
  BannerMessageIds,
  PartialTaskMainData,
  TaskMetadata,
  OneTimeTaskMetadata,
  Group,
} from 'common/types/store-types';
import { error, ignore } from 'common/util/general-util';
import {
  FirestoreTask,
  FirestoreGroup,
  FirestoreUserData,
  FirestoreCommonTask,
} from 'common/types/firestore-types';
import Actions from 'common/firebase/common-actions';
import { subTasksEqual } from 'common/util/task-util';
import {
  reportAddTagEvent,
  reportEditTagEvent,
  reportDeleteTagEvent,
  reportAddTaskEvent,
  reportEditTaskEvent,
  reportDeleteTaskEvent,
  reportCompleteTaskEvent,
  reportFocusTaskEvent,
} from '../util/ga-util';
import { getAppUser } from './auth-util';
import { database } from './db';
import { store } from '../store/store';
import { patchTags, patchTasks } from '../store/actions';
import { Diff } from '../components/Util/TaskEditors/TaskEditor/task-diff-reducer';

const actions = new Actions(() => getAppUser().email, database);

const mergeWithOwner = <T>(obj: T): T & { readonly owner: string } => ({
  owner: getAppUser().email,
  ...obj,
});

type WithoutIdOrder<Props> = Pick<Props, Exclude<keyof Props, 'id' | 'order'>>;
type WithoutId<Props> = Pick<Props, Exclude<keyof Props, 'id'>>;
export type TaskWithoutIdOrderChildren<M = TaskMetadata> = Omit<
  Task<M>,
  'id' | 'order' | 'children'
>;

export type TaskWithoutIdOrder<M = TaskMetadata> = Omit<Task<M>, 'id' | 'order'>;

/*
 * --------------------------------------------------------------------------------
 * Section 1: Tags Actions
 * --------------------------------------------------------------------------------
 */

export const addTag = (tag: WithoutIdOrder<Tag>): void => {
  const { tags } = store.getState();
  const { classId } = tag;
  if (classId != null && Array.from(tags.values()).some((t: Tag) => t.classId === classId)) {
    return;
  }
  actions.addTag(tag).then(reportAddTagEvent);
};

export const editTag = (tag: Tag): void => {
  actions.editTag(tag).then(reportEditTagEvent);
};

export const removeTag = (id: string): void => {
  actions.removeTag(id).then(reportDeleteTagEvent);
};

/*
 * --------------------------------------------------------------------------------
 * Section 2: Tasks Actions
 * --------------------------------------------------------------------------------
 */

export const addTask = (
  owner: readonly string[],
  task: TaskWithoutIdOrderChildren,
  subTasks: WithoutId<SubTask>[]
): void => {
  actions.addTask(owner, task, subTasks).then(() => reportAddTaskEvent());
};

export const removeAllForks = (taskId: string): void => {
  actions.removeAllForks(store.getState(), taskId).then(ignore);
};

export const handleTaskDiffs = (taskId: string, { mainTaskEdits }: Diff): void => {
  actions.handleTaskDiffs(taskId, { mainTaskEdits }).then(() => {
    if (
      mainTaskEdits.name ||
      mainTaskEdits.complete ||
      mainTaskEdits.date ||
      mainTaskEdits.inFocus ||
      mainTaskEdits.tag ||
      mainTaskEdits.children
    ) {
      reportEditTaskEvent();
    }
    if (mainTaskEdits.complete) {
      reportCompleteTaskEvent();
    }
    if (mainTaskEdits.inFocus) {
      reportFocusTaskEvent();
    }
  });
};

export type EditType = 'EDITING_MASTER_TEMPLATE' | 'EDITING_ONE_TIME_TASK';

export const editTaskWithDiff = (taskId: string, editType: EditType, diff: Diff): void => {
  actions.editTaskWithDiff(store.getState(), taskId, editType, diff);
};

export const forkTaskWithDiff = (taskId: string, replaceDate: Date, diff: Diff): void =>
  actions.forkTaskWithDiff(store.getState(), taskId, replaceDate, diff);

export const removeTask = (task: Task): void => {
  actions.removeTask(store.getState(), task).then(() => reportDeleteTaskEvent());
};

export const removeOneRepeatedTask = (taskId: string, replaceDate: Date): void => {
  actions.removeOneRepeatedTask(store.getState(), taskId, replaceDate);
};

export const editMainTask = (
  taskId: string,
  replaceDate: Date | null,
  mainTaskEdits: PartialTaskMainData
): void => actions.editMainTask(store.getState(), taskId, replaceDate, mainTaskEdits);

/*
 * --------------------------------------------------------------------------------
 * Section 3: Groups Actions
 * --------------------------------------------------------------------------------
 */

/**
 * Reject a group invite.
 * @param groupID  Document ID of the group's Firestore document.
 */
export const rejectInvite = async (groupID: string): Promise<void> => {
  const { groupInvites } = store.getState();
  const invitees = groupInvites.get(groupID)?.invitees;
  if (!invitees) return;
  const inviterNames = groupInvites.get(groupID)?.inviterNames;
  if (!inviterNames) return;

  // get index of inviterName to remove
  let currIndex = 0;
  let targetIndex = 0;
  const { email } = getAppUser();
  invitees.forEach((invitee) => {
    if (invitee === email) {
      targetIndex = currIndex;
    }
    currIndex += 1;
  });
  // get new list of inviterNames
  currIndex = 0;
  const newInviterNames: string[] = [];
  inviterNames.forEach((item) => {
    if (currIndex !== targetIndex) {
      newInviterNames.push(item);
    }
    currIndex += 1;
  });
  // get new list of invitees
  const newInvitees: string[] = invitees.filter((invitee) => invitee !== email);
  // update both invitees and inviterNames lists
  const groupDoc = await database.groupsCollection().doc(groupID);
  await groupDoc.update({ invitees: newInvitees, inviterNames: newInviterNames });
};

/**
 * Get the inviter's name.
 * @param groupID  Document ID of the group's Firestore document.
 * @returns a string of the name of the person who sent the group invitation.
 */
export const getInviterName = (groupID: string): string => {
  const { email } = getAppUser(); // email of the invited person
  const { groupInvites } = store.getState();
  const invitees = groupInvites.get(groupID)?.invitees;
  const inviterNames = groupInvites.get(groupID)?.inviterNames;
  if (!invitees || !inviterNames) return 'Unknown user';
  let currIndex = 0;
  let targetIndex = 0;
  invitees.forEach((invitee) => {
    if (invitee === email) {
      targetIndex = currIndex;
    }
    currIndex += 1;
  });
  return inviterNames[targetIndex];
};

/**
 * Join a group.
 * @param groupID  Document ID of the group's Firestore document.
 */
export const joinGroup = async (groupID: string): Promise<void> => {
  const groupDoc = database.groupsCollection().doc(groupID);
  const { email } = getAppUser();
  // Get current list of invitees (if any)
  const invitees = await groupDoc
    .get()
    .then((snapshot) => (snapshot.data() as FirestoreGroup)?.invitees);
  // Check if user is not in invitees list
  if (invitees === undefined || !invitees.includes(email)) {
    throw new Error('Invalid invitation');
  }
  const members = await groupDoc
    .get()
    .then((snapshot) => (snapshot.data() as FirestoreGroup)?.members);
  // Check if user is already in the group
  if (members === undefined || members.includes(email)) {
    throw new Error('Invalid group members');
  }
  // Add user to group
  await groupDoc.update({ members: [...members, email] });

  // TODO remove this whole function after we get a Cloud Function working;
  // the following line is a hack
  rejectInvite(groupID);
};

/**
 * Create a group.
 * @param name The name of the group
 * @param deadline Deadline for the group project
 * @param classCode Class code for the class associated with the group
 */
export const createGroup = (name: string, deadline: Date, classCode: string): void => {
  const { email } = getAppUser();
  // creator is the only member at first
  const newGroup: FirestoreGroup = {
    name,
    deadline: firestore.Timestamp.fromDate(deadline),
    classCode,
    members: [email],
    invitees: [],
    inviterNames: [],
  };
  database.groupsCollection().doc().set(newGroup);
};

/**
 * Leave a group.
 * @param groupID Document ID of the group's Firestore document. The user calling this function must
 *                be a member of this group.
 */
export const leaveGroup = async (groupID: string): Promise<void> => {
  const { groups } = store.getState();
  const members = groups.get(groupID)?.members;
  if (members === undefined) {
    return;
  }
  const { email } = getAppUser();
  const newMembers: string[] = members.filter((m) => m !== email);
  const groupDoc = await database.groupsCollection().doc(groupID);
  if (newMembers.length === 0) {
    await groupDoc.delete();
  } else {
    await groupDoc.update({ members: newMembers });
  }
};

export const updateGroup = async ({ id, deadline, ...groupInformation }: Group): Promise<void> => {
  const deadlineDate = firestore.Timestamp.fromDate(deadline);
  await database
    .groupsCollection()
    .doc(id)
    .update({ ...groupInformation, deadline: deadlineDate });
};

/**
 * Send an invitation to a user to join a group.
 * @param groupID Document ID of the group's Firestore document. The user calling this function must
 *                be a member of this group.
 * @param inviteeEmail The full Cornell email of the user receiving the invitation (all lowercase)
 */
export const sendInvite = async (groupID: string, inviteeEmail: string): Promise<void> => {
  const groupDoc = await database.groupsCollection().doc(groupID);
  // get current list of invites and inviterNames (if any)
  const invitees = await groupDoc
    .get()
    .then((snapshot) => (snapshot.data() as FirestoreGroup)?.invitees);

  const inviterNames = await groupDoc
    .get()
    .then((snapshot) => (snapshot.data() as FirestoreGroup)?.inviterNames);
  const inviterName = getAppUser().displayName;

  // Add invitee to invitees if they have not already been invited
  if (invitees === undefined) {
    await groupDoc.update({
      invitees: [inviteeEmail],
      inviterNames: [inviterName],
    });
  } else if (!invitees.includes(inviteeEmail)) {
    await groupDoc.update({
      invitees: [...invitees, inviteeEmail],
      inviterNames: [...inviterNames, inviterName],
    });
  }
};

export const addUserInfo = async (
  email: string,
  fullName: string,
  photoURL: string | null
): Promise<void> => {
  database.db().runTransaction(async (transaction) => {
    const userDoc = await database.usersCollection().doc(email);
    const snapshot = await transaction.get(userDoc);

    if (snapshot.exists) {
      const userInfoPartial: Partial<FirestoreUserData> = {
        name: fullName,
        photoURL: photoURL || 'Default Photo',
      };
      transaction.update(userDoc, userInfoPartial);
    } else {
      const userInfo: FirestoreUserData = {
        name: fullName,
        photoURL: photoURL || 'Default Photo',
      };
      transaction.set(userDoc, userInfo);
    }
  });
};
/*
 * --------------------------------------------------------------------------------
 * Section 4: Other Compound Actions
 * --------------------------------------------------------------------------------
 */

/**
 * Clear all the completed tasks in focus view.
 */
export const clearFocus = async (
  taskIds: string[],
  subTasksWithParentTaskId: Map<string, SubTask[]>
): Promise<void> => {
  const batch = database.db().batch();
  const taskUpdatePromise = taskIds.map(async (id) => {
    const doc = database.tasksCollection().doc(id);
    const snapshot = await doc.get();
    const { children } = (await snapshot.data()) as FirestoreCommonTask;
    batch.update(doc, { inFocus: false });
    batch.set(doc, {
      children: children.map(({ inFocus, ...rest }) => ({ inFocus: false, ...rest })),
    });
  });
  const subTaskUpdatePromise = subTasksWithParentTaskId.map(async (childrenToBeUpdated, taskId) => {
    const doc = database.tasksCollection().doc(taskId);
    const snapshot = await doc.get();
    const { children } = (await snapshot.data()) as FirestoreCommonTask;

    batch.set(doc, {
      children: children.map(({ inFocus, ...rest }) =>
        childrenToBeUpdated.some((s) =>
          subTasksEqual(s, { inFocus, ...rest })
            ? { inFocus: false, ...rest }
            : { inFocus, ...rest }
        )
      ),
    });
  });

  await Promise.all([Promise.all(taskUpdatePromise), Promise.all(subTaskUpdatePromise)]);
  batch.commit().then(ignore);
};

/**
 * Declare a task is complete in focus view by dragging it to completed section.
 *
 * @param completedTaskIdOrder the id and order of the completed task.
 * @param completedList the id order list of completed tasks.
 * @param uncompletedList the id order list of not completed tasks.
 * @returns an object of updated completed and not completed task list.
 */
export function completeTaskInFocus<T extends { readonly id: string; readonly order: number }>(
  completedTaskIdOrder: T
): void {
  const { tasks } = store.getState();
  const task = tasks.get(completedTaskIdOrder.id) ?? error('bad');
  store.dispatch(
    patchTasks(
      [],
      [
        {
          ...task,
          complete: true,
          children: task.children.map((subTask) => ({ ...subTask, complete: true })),
        },
      ],
      []
    )
  );
  const batch = database.db().batch();
  const doc = database.tasksCollection().doc(task.id);
  if (task.inFocus) {
    batch.update(doc, { complete: true });
  }
  batch.set(doc, {
    children: task.children.map(({ inFocus, complete, ...rest }) =>
      inFocus ? { inFocus, complete: true, rest } : { inFocus, complete, rest }
    ),
  });
  batch.commit().then(ignore);
}

/**
 * Reorder a list of items by swapping items with order sourceOrder and destinationOrder
 *
 * @param orderFor whether the reorder is for tags or tasks.
 * @param reorderMap the map that maps the id of changed order items to new order ids.
 * @return a new list with updated orders.
 */
export function applyReorder(orderFor: 'tags' | 'tasks', reorderMap: Map<string, number>): void {
  const { tags, tasks } = store.getState();
  if (orderFor === 'tags') {
    const editedTags: Tag[] = [];
    Array.from(reorderMap.entries()).forEach(([id, order]) => {
      const existingTag = tags.get(id);
      if (existingTag !== undefined) {
        editedTags.push({ ...existingTag, order });
      }
    });
    store.dispatch(patchTags([], editedTags, []));
  } else {
    const editedTasks: Task[] = [];
    Array.from(reorderMap.entries()).forEach(([id, order]) => {
      const existingTask = tasks.get(id);
      if (existingTask !== undefined) {
        editedTasks.push({
          ...existingTask,
          order,
          children: existingTask.children,
        });
      }
    });
    store.dispatch(patchTasks([], editedTasks, []));
  }
  const collection =
    orderFor === 'tags'
      ? (id: string) => database.tagsCollection().doc(id)
      : (id: string) => database.tasksCollection().doc(id);
  const batch = database.db().batch();
  reorderMap.forEach((order, id) => {
    batch.update(collection(id), { order });
  });
  batch.commit().then(ignore);
}

export const completeOnboarding = (completedOnboarding: boolean): void => {
  database
    .settingsCollection()
    .doc(getAppUser().email)
    .update({ completedOnboarding })
    .then(ignore);
};

export const setCanvasCalendar = (canvasCalendar: string | null | undefined): void => {
  database.settingsCollection().doc(getAppUser().email).update({ canvasCalendar }).then(ignore);
};

export const readBannerMessage = (bannerMessageId: BannerMessageIds, isRead: boolean): void => {
  const docRef = database.bannerMessageStatusCollection().doc(getAppUser().email);
  database.db().runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (doc.exists) {
      transaction.update(docRef, { [bannerMessageId]: isRead });
    } else {
      transaction.set(docRef, { [bannerMessageId]: isRead });
    }
  });
};

export const importCourseExams = (): void => {
  const { tags, tasks, courses } = store.getState();
  const newTasks: TaskWithoutIdOrderChildren<OneTimeTaskMetadata>[] = [];
  tags.forEach((tag: Tag) => {
    if (tag.classId === null) {
      return;
    }
    const allCoursesWithId = courses.get(tag.classId);
    if (allCoursesWithId == null) {
      return; // not an error because it may be courses in previous semesters.
    }
    allCoursesWithId.forEach((course: Course) => {
      course.examTimes.forEach(({ type, time }) => {
        let courseType: string;
        switch (type) {
          case 'final':
            courseType = 'Final';
            break;
          case 'prelim':
            courseType = 'Prelim';
            break;
          case 'semifinal':
            courseType = 'Semifinal';
            break;
          default:
            throw new Error('Undefined course exam type');
        }
        const examName = `${course.subject} ${course.courseNumber} ${courseType}`;
        const t = new Date(time);
        const filter = (task: Task): boolean => {
          if (task.metadata.type === 'MASTER_TEMPLATE') {
            return false;
          }
          const {
            name,
            metadata: { date },
          } = task;
          return (
            task.tag === tag.id &&
            name === examName &&
            date.getFullYear() === t.getFullYear() &&
            date.getMonth() === t.getMonth() &&
            date.getDate() === t.getDate() &&
            date.getHours() === t.getHours()
          );
        };
        if (!Array.from(tasks.values()).some(filter)) {
          const newTask: TaskWithoutIdOrderChildren<OneTimeTaskMetadata> = {
            owner: [getAppUser().email],
            name: examName,
            tag: tag.id,
            complete: false,
            inFocus: false,
            metadata: {
              type: 'ONE_TIME',
              date: t,
            },
          };
          newTasks.push(newTask);
        }
      });
    });
  });
  actions.orderManager.allocateNewOrder('tasks', newTasks.length).then((startOrder: number) => {
    const newOrderedTasks = newTasks.map((t, i) => ({ ...t, order: i + startOrder }));
    const batch = database.db().batch();
    newOrderedTasks.forEach(({ metadata, ...rest }) => {
      const transformedTask: FirestoreTask = mergeWithOwner({ ...rest, ...metadata, children: [] });
      batch.set(database.tasksCollection().doc(), transformedTask);
    });
    // eslint-disable-next-line no-alert
    batch.commit().then(() => alert('Exams Added Successfully!'));
  });
};
