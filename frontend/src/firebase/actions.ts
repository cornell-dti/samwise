import { firestore } from 'firebase/app';
import { Map, Set } from 'immutable';
import {
  reportAddTagEvent,
  reportEditTagEvent,
  reportDeleteTagEvent,
  reportAddTaskEvent,
  reportEditTaskEvent,
  reportDeleteTaskEvent,
  reportAddSubTaskEvent,
  reportEditSubTaskEvent,
  reportDeleteSubTaskEvent,
  reportCompleteTaskEvent,
  reportFocusTaskEvent,
} from '../util/ga-util';
import {
  Course,
  SubTask,
  Tag,
  Task,
  BannerMessageIds,
  PartialMainTask,
  PartialSubTask,
  RepeatingTask,
  OneTimeTask,
} from '../store/store-types';
import {
  FirestoreCommon,
  FirestoreTag,
  FirestoreTask,
  FirestoreSubTask,
} from './firestore-types';
import { getAppUser } from './auth-util';
import {
  db,
  settingsCollection,
  subTasksCollection,
  tagsCollection,
  tasksCollection,
  bannerMessageStatusCollection,
} from './db';
import { getNewTaskId } from './id-provider';
import { error, ignore } from '../util/general-util';
import allocateNewOrder from './order-manager';
import { store } from '../store/store';
import { NONE_TAG_ID } from '../util/tag-util';
import { Diff } from '../components/Util/TaskEditors/TaskEditor/task-diff-reducer';

async function createFirestoreObject<T>(
  orderFor: 'tags' | 'tasks', source: T,
): Promise<T & FirestoreCommon> {
  const order = await allocateNewOrder(orderFor);
  return { ...source, owner: getAppUser().email, order };
}

const mergeWithOwner = <T>(obj: T): T & { readonly owner: string } => ({
  owner: getAppUser().email, ...obj,
});

type WithoutIdOrder<Props> = Pick<Props, Exclude<keyof Props, 'id' | 'order'>>;
type WithoutId<Props> = Pick<Props, Exclude<keyof Props, 'id'>>;
type CommonTaskWithoutIdOrderChildren<T> = Pick<T, Exclude<keyof T, 'id' | 'order' | 'children'>>;
type OneTimeTaskWithoutIdOrderChildren = CommonTaskWithoutIdOrderChildren<OneTimeTask>;
type RepeatedTaskWithoutIdOrderChildren = CommonTaskWithoutIdOrderChildren<RepeatingTask>;
export type TaskWithoutIdOrderChildren =
  | OneTimeTaskWithoutIdOrderChildren
  | RepeatedTaskWithoutIdOrderChildren;

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
  createFirestoreObject('tags', tag)
    .then((firebaseTag: FirestoreTag) => tagsCollection().add(firebaseTag))
    .then(reportAddTagEvent);
};

export const editTag = (tag: Tag): void => {
  const { id, ...rest } = tag;
  tagsCollection().doc(id)
    .update(rest)
    .then(reportEditTagEvent);
};

export const removeTag = (id: string): void => {
  tasksCollection()
    .where('owner', '==', getAppUser().email)
    .where('tag', '==', id)
    .get()
    .then((s) => {
      const batch = db().batch();
      s.docs.filter((doc) => doc.data().type === 'TASK')
        .forEach((doc) => {
          batch.update(tasksCollection().doc(doc.id), { tag: NONE_TAG_ID });
        });
      batch.delete(tagsCollection().doc(id));
      batch.commit().then(ignore);
    })
    .then(reportDeleteTagEvent);
};

/*
 * --------------------------------------------------------------------------------
 * Section 2: Tasks Actions
 * --------------------------------------------------------------------------------
 */

const asyncAddTask = async (
  newTaskId: string,
  task: TaskWithoutIdOrderChildren,
  subTasks: WithoutId<SubTask>[],
  batch: firestore.WriteBatch,
): Promise<{ readonly firestoreTask: FirestoreTask; readonly createdSubTasks: SubTask[] }> => {
  const baseTask: FirestoreCommon = await createFirestoreObject('tasks', {});
  const createdSubTasks: SubTask[] = subTasks.map((subtask) => {
    const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subtask);
    const subtaskDoc = subTasksCollection().doc();
    batch.set(subtaskDoc, firebaseSubTask);
    return { ...subtask, id: subtaskDoc.id };
  });
  const subtaskIds = createdSubTasks.map((s) => s.id);
  const firestoreTask: FirestoreTask = { ...baseTask, ...task, children: subtaskIds };
  batch.set(tasksCollection().doc(newTaskId), firestoreTask);
  return { firestoreTask, createdSubTasks };
};

export const addTask = (
  task: TaskWithoutIdOrderChildren,
  subTasks: WithoutId<SubTask>[],
): void => {
  const newTaskId = getNewTaskId();
  const batch = db().batch();
  asyncAddTask(newTaskId, task, subTasks, batch).then(({ createdSubTasks }) => {
    batch.commit().then(() => {
      reportAddTaskEvent();
      createdSubTasks.forEach(reportAddSubTaskEvent);
    });
  });
};

export const removeAllForks = (taskId: string): void => {
  (async () => {
    const { tasks } = store.getState();
    const task = tasks.get(taskId) || error('bad!');
    const repeatingTask = task as RepeatingTask;
    const forkIds = repeatingTask.forks.map((fork) => fork.forkId);
    const batch = db().batch();
    forkIds.forEach((id) => {
      if (id !== null) {
        // delete forked main task
        batch.delete(tasksCollection().doc(id));
        // delete forked subtasks
        const forkedTask = tasks.get(id);
        if (forkedTask != null) {
          forkedTask.children.forEach(
            (subTaskId) => batch.delete(subTasksCollection().doc(subTaskId)),
          );
        }
      }
    });
    // clear the forked array
    batch.update(tasksCollection().doc(taskId), { forks: [] });
    batch.commit().then(ignore);
  })();
};

export const handleTaskDiffs = (
  taskId: string,
  { subTaskCreations, subTaskEdits, subTaskDeletions, mainTaskEdits }: Diff,
): void => {
  const batch = db().batch();
  if (subTaskCreations.size !== 0) {
    subTaskCreations.forEach((subTask, id) => {
      const newSubTaskDoc = subTasksCollection().doc(id);
      const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subTask);
      batch.set(newSubTaskDoc, firebaseSubTask);
      batch.update(tasksCollection().doc(taskId), {
        children: firestore.FieldValue.arrayUnion(newSubTaskDoc.id),
      });
    });
  }
  if (subTaskEdits.size !== 0) {
    subTaskEdits.forEach((partialSubTask, id) => {
      batch.update(subTasksCollection().doc(id), partialSubTask);
    });
  }
  if (subTaskDeletions.size !== 0) {
    subTaskDeletions.forEach((id) => {
      batch.delete(subTasksCollection().doc(id));
      batch.update(tasksCollection().doc(taskId), {
        children: firestore.FieldValue.arrayRemove(id),
      });
    });
  }
  batch.update(tasksCollection().doc(taskId), mainTaskEdits);
  batch.commit().then(() => {
    if (mainTaskEdits.name
      || mainTaskEdits.complete
      || mainTaskEdits.date
      || mainTaskEdits.inFocus
      || mainTaskEdits.tag) {
      reportEditTaskEvent();
    }
    if (mainTaskEdits.complete) {
      reportCompleteTaskEvent();
    }
    if (mainTaskEdits.inFocus) {
      reportFocusTaskEvent();
    }
    subTaskCreations.forEach(reportAddSubTaskEvent);
    subTaskEdits.forEach(reportEditSubTaskEvent);
    subTaskDeletions.forEach(reportDeleteSubTaskEvent);
  });
};

type EditType = 'EDITING_MASTER_TEMPLATE' | 'EDITING_ONE_TIME_TASK';

export const editTaskWithDiff = (
  taskId: string,
  editType: EditType,
  { mainTaskEdits, subTaskCreations, subTaskEdits, subTaskDeletions }: Diff,
): void => {
  (async () => {
    if (editType === 'EDITING_MASTER_TEMPLATE') {
      await removeAllForks(taskId);
    }
    handleTaskDiffs(taskId, { subTaskCreations, subTaskEdits, subTaskDeletions, mainTaskEdits });
  })();
};

export const forkTaskWithDiff = (
  taskId: string,
  replaceDate: Date,
  { mainTaskEdits, subTaskCreations, subTaskEdits, subTaskDeletions }: Diff,
): void => {
  const { tasks, subTasks } = store.getState();
  const repeatingTaskMaster = tasks.get(taskId) as RepeatingTask;
  const {
    id, order, type, children, date, forks, ...originalTaskWithoutId
  } = repeatingTaskMaster;
  const newMainTask: TaskWithoutIdOrderChildren = {
    ...originalTaskWithoutId, ...mainTaskEdits, date: replaceDate, type: 'ONE_TIME',
  };
  const newSubTasks: WithoutId<SubTask>[] = [];
  subTaskCreations.forEach((s) => newSubTasks.push(s));
  children.forEach((childrenId) => {
    if (subTaskDeletions.has(childrenId)) {
      return;
    }
    const subTask = subTasks.get(childrenId);
    if (subTask == null) {
      return;
    }
    const { id: _, ...subTaskContent } = subTask;
    const subTaskEdit = subTaskEdits.get(childrenId);
    if (subTaskEdit != null) {
      newSubTasks.push({ ...subTaskContent, ...subTaskEdit });
    } else {
      newSubTasks.push(subTaskContent);
    }
  });
  const batch = db().batch();
  const forkId = getNewTaskId();
  asyncAddTask(forkId, newMainTask, newSubTasks, batch).then(() => {
    batch.update(tasksCollection().doc(id), {
      forks: firestore.FieldValue.arrayUnion({ forkId, replaceDate }),
    });
    batch.commit();
  });
};

export const removeTask = (task: Task): void => {
  const { tasks, repeatedTaskSet } = store.getState();
  const batch = db().batch();
  batch.delete(tasksCollection().doc(task.id));
  task.children.forEach((id) => batch.delete(subTasksCollection().doc(id)));
  if (task.type === 'ONE_TIME') {
    // remove fork mentions
    repeatedTaskSet.forEach((repeatedTaskId) => {
      const repeatedTask = tasks.get(repeatedTaskId) as RepeatingTask | null | undefined;
      if (repeatedTask == null) {
        return;
      }
      const oldForks = repeatedTask.forks;
      let needUpdateFork = false;
      const newForks = [];
      for (let i = 0; i < oldForks.length; i += 1) {
        const fork = oldForks[i];
        if (fork.forkId === task.id) {
          needUpdateFork = true;
          newForks.push({ forkId: null, replaceDate: fork.replaceDate });
        } else {
          newForks.push(fork);
        }
      }
      if (needUpdateFork) {
        batch.update(tasksCollection().doc(repeatedTaskId), { forks: newForks });
      }
    });
  } else {
    // also delete all forks
    task.forks.forEach((fork) => {
      const { forkId } = fork;
      if (forkId == null) {
        return;
      }
      batch.delete(tasksCollection().doc(forkId));
      const forkedTask = tasks.get(forkId);
      if (forkedTask != null) {
        forkedTask.children.forEach((id) => batch.delete(subTasksCollection().doc(id)));
      }
    });
  }
  batch.commit().then(() => {
    reportDeleteTaskEvent();
  });
};

export const removeOneRepeatedTask = (taskId: string, replaceDate: Date): void => {
  tasksCollection().doc(taskId).update({
    forks: firestore.FieldValue.arrayUnion({ forkId: null, replaceDate }),
  });
};

export const editMainTask = (
  taskId: string, replaceDate: Date | null, mainTaskEdits: PartialMainTask,
): void => {
  const diff: Diff = {
    mainTaskEdits,
    subTaskCreations: Map(),
    subTaskEdits: Map(),
    subTaskDeletions: Set(),
  };
  if (replaceDate === null) {
    editTaskWithDiff(taskId, 'EDITING_ONE_TIME_TASK', diff);
  } else {
    const dateEdit = mainTaskEdits.date != null ? mainTaskEdits.date : replaceDate;
    const newDiff = { ...diff, mainTaskEdits: { ...diff.mainTaskEdits, date: dateEdit } };
    forkTaskWithDiff(taskId, replaceDate, newDiff);
  }
};

export const editSubTask = (
  taskId: string, subtaskId: string, replaceDate: Date | null, partialSubTask: PartialSubTask,
): void => {
  const diff: Diff = {
    mainTaskEdits: replaceDate == null ? {} : { date: replaceDate },
    subTaskCreations: Map(),
    subTaskEdits: Map<string, PartialSubTask>().set(subtaskId, partialSubTask),
    subTaskDeletions: Set(),
  };
  if (replaceDate === null) {
    editTaskWithDiff(taskId, 'EDITING_ONE_TIME_TASK', diff);
  } else {
    forkTaskWithDiff(taskId, replaceDate, diff);
  }
};

export const removeSubTask = (
  taskId: string, subtaskId: string, replaceDate: Date | null,
): void => {
  const diff: Diff = {
    mainTaskEdits: replaceDate == null ? {} : { date: replaceDate },
    subTaskCreations: Map(),
    subTaskEdits: Map(),
    subTaskDeletions: Set.of(subtaskId),
  };
  if (replaceDate === null) {
    editTaskWithDiff(taskId, 'EDITING_ONE_TIME_TASK', diff);
  } else {
    forkTaskWithDiff(taskId, replaceDate, diff);
  }
};

/*
 * --------------------------------------------------------------------------------
 * Section 3: Other Compound Actions
 * --------------------------------------------------------------------------------
 */

/**
 * Clear all the completed tasks in focus view.
 */
export const clearFocus = (taskIds: string[], subTaskIds: string[]): void => {
  const batch = db().batch();
  taskIds.forEach((id) => batch.update(tasksCollection().doc(id), { inFocus: false }));
  subTaskIds.forEach((id) => batch.update(subTasksCollection().doc(id), { inFocus: false }));
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
  completedTaskIdOrder: T,
  completedList: T[],
): void {
  let newCompletedList = [completedTaskIdOrder];
  completedList.forEach((item) => {
    if (item.order < completedTaskIdOrder.order) {
      newCompletedList.push(item);
    } else if (item.order >= completedTaskIdOrder.order) {
      newCompletedList.push({ ...item, order: item.order + 1 });
    }
  });
  newCompletedList = newCompletedList.sort((a, b) => a.order - b.order);
  const { tasks, subTasks } = store.getState();
  const task = tasks.get(completedTaskIdOrder.id) || error('bad');
  const batch = db().batch();
  if (task.inFocus) {
    batch.update(tasksCollection().doc(task.id), { complete: true });
  }
  task.children.forEach((id) => {
    const s = subTasks.get(id);
    if (s != null && s.inFocus) {
      batch.update(subTasksCollection().doc(id), { complete: true });
    }
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
export function applyReorder(
  orderFor: 'tags' | 'tasks',
  reorderMap: Map<string, number>,
): void {
  const collection = orderFor === 'tags'
    ? (id: string) => tagsCollection().doc(id)
    : (id: string) => tasksCollection().doc(id);
  const batch = db().batch();
  reorderMap.forEach((order, id) => {
    batch.update(collection(id), { order });
  });
  batch.commit().then(ignore);
}

export const completeOnboarding = (completedOnboarding: boolean): void => {
  settingsCollection().doc(getAppUser().email)
    .update({ completedOnboarding })
    .then(ignore);
};

export const setCanvasCalendar = (canvasCalendar: string | null): void => {
  settingsCollection().doc(getAppUser().email)
    .update({ canvasCalendar })
    .then(ignore);
};

export const readBannerMessage = (bannerMessageId: BannerMessageIds, isRead: boolean): void => {
  const docRef = bannerMessageStatusCollection().doc(getAppUser().email);
  db().runTransaction(async (transaction) => {
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
  const newTasks: OneTimeTaskWithoutIdOrderChildren[] = [];
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
        const courseType = type === 'final' ? 'Final' : 'Prelim';
        const examName = `${course.subject} ${course.courseNumber} ${courseType}`;
        const t = new Date(time);
        const filter = (task: Task): boolean => {
          if (task.type === 'MASTER_TEMPLATE') {
            return false;
          }
          const { name, date } = task;
          return task.tag === tag.id && name === examName
            && date.getFullYear() === t.getFullYear()
            && date.getMonth() === t.getMonth()
            && date.getDate() === t.getDate()
            && date.getHours() === t.getHours();
        };
        if (!Array.from(tasks.values()).some(filter)) {
          const newTask: OneTimeTaskWithoutIdOrderChildren = {
            type: 'ONE_TIME',
            name: examName,
            tag: tag.id,
            date: t,
            complete: false,
            inFocus: false,
          };
          newTasks.push(newTask);
        }
      });
    });
  });
  allocateNewOrder('tasks', newTasks.length)
    .then((startOrder: number) => {
      const newOrderedTasks = newTasks.map((t, i) => ({ ...t, order: i + startOrder }));
      const batch = db().batch();
      newOrderedTasks.forEach((orderedTask) => {
        const transformedTask: FirestoreTask = mergeWithOwner({ ...orderedTask, children: [] });
        batch.set(tasksCollection().doc(), transformedTask);
      });
      // eslint-disable-next-line no-alert
      batch.commit().then(() => alert('Exams Added Successfully!'));
    });
};
