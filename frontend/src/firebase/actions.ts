import { firestore } from 'firebase/app';
import { Map, Set } from 'immutable';
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
} from 'common/lib/types/store-types';
import { error, ignore } from 'common/lib/util/general-util';
import {
  FirestoreCommon,
  FirestoreTask,
  FirestoreSubTask,
} from 'common/lib/types/firestore-types';
import { WriteBatch } from 'common/lib/firebase/database';
import Actions from 'common/lib/firebase/common-actions';
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
import { getAppUser } from './auth-util';
import { db, database } from './db';
import { getNewTaskId } from './id-provider';
import { store } from '../store/store';
import { Diff } from '../components/Util/TaskEditors/TaskEditor/task-diff-reducer';

const actions = new Actions(() => getAppUser().email, database);

async function createFirestoreObject<T>(
  orderFor: 'tags' | 'tasks',
  source: T,
): Promise<T & FirestoreCommon> {
  const order = await actions.orderManager.allocateNewOrder(orderFor);
  return { ...source, owner: getAppUser().email, order };
}

const mergeWithOwner = <T>(obj: T): T & { readonly owner: string } => ({
  owner: getAppUser().email,
  ...obj,
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
  actions.addTag(tag).then(reportAddTagEvent);
};

export const editTag = (tag: Tag): void => {
  actions.editTag(tag).then(reportEditTagEvent);
};

export const removeTag = (id: string): void => {
  actions.removeTag(id).then(reportDeleteTagEvent);
};

export const getCanvasTag = (taskName?: string): string => {
  const { tags } = store.getState();
  let tagId = 'THE_GLORIOUS_NONE_TAG';
  tags.forEach((tag: Tag) => {
    // tag names for imported classes have the form
    // 'CS 4820: Intro Analysis of Algorithms'
    const { id, name } = tag;
    const tagName = name.split(':')[0].replace(/\s/g, '');
    // canvas task names have the form 'HW 3 [MATH2930]'
    const canvasName = taskName?.split('[')[1].replace(/]/g, '');
    if (tagName === canvasName) {
      tagId = id;
    }
  });
  return tagId;
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
  batch: WriteBatch,
): Promise<{ readonly firestoreTask: FirestoreTask; readonly createdSubTasks: SubTask[] }> => {
  const baseTask: FirestoreCommon = await createFirestoreObject('tasks', {});
  const createdSubTasks: SubTask[] = subTasks.map((subtask) => {
    const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subtask);
    const subtaskDoc = database.subTasksCollection().doc();
    batch.set(subtaskDoc, firebaseSubTask);
    return { ...subtask, id: subtaskDoc.id };
  });
  const subtaskIds = createdSubTasks.map((s) => s.id);
  const firestoreTask: FirestoreTask = { ...baseTask, ...task, children: subtaskIds };
  batch.set(database.tasksCollection().doc(newTaskId), firestoreTask);
  return { firestoreTask, createdSubTasks };
};

export const addTask = (task: TaskWithoutIdOrderChildren, subTasks: WithoutId<SubTask>[]): void => {
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
    const task = tasks.get(taskId) ?? error('bad!');
    const repeatingTask = task as RepeatingTask;
    const forkIds = repeatingTask.forks.map((fork) => fork.forkId);
    const batch = database.db().batch();
    forkIds.forEach((id) => {
      if (id !== null) {
        // delete forked main task
        batch.delete(database.tasksCollection().doc(id));
        // delete forked subtasks
        const forkedTask = tasks.get(id);
        if (forkedTask != null) {
          forkedTask.children.forEach(
            (subTaskId) => batch.delete(database.subTasksCollection().doc(subTaskId)),
          );
        }
      }
    });
    // clear the forked array
    batch.update(database.tasksCollection().doc(taskId), { forks: [] });
    batch.commit().then(ignore);
  })();
};

export const handleTaskDiffs = (
  taskId: string,
  { subTaskCreations, subTaskEdits, subTaskDeletions, mainTaskEdits }: Diff,
): void => {
  const batch = database.db().batch();
  if (subTaskCreations.size !== 0) {
    subTaskCreations.forEach((subTask, id) => {
      const newSubTaskDoc = database.subTasksCollection().doc(id);
      const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subTask);
      batch.set(newSubTaskDoc, firebaseSubTask);
      batch.update(database.tasksCollection().doc(taskId), {
        children: firestore.FieldValue.arrayUnion(newSubTaskDoc.id),
      });
    });
  }
  if (subTaskEdits.size !== 0) {
    subTaskEdits.forEach((partialSubTask, id) => {
      batch.update(database.subTasksCollection().doc(id), partialSubTask);
    });
  }
  if (subTaskDeletions.size !== 0) {
    subTaskDeletions.forEach((id) => {
      batch.delete(database.subTasksCollection().doc(id));
      batch.update(database.tasksCollection().doc(taskId), {
        children: firestore.FieldValue.arrayRemove(id),
      });
    });
  }
  batch.update(database.tasksCollection().doc(taskId), mainTaskEdits);
  batch.commit().then(() => {
    if (
      mainTaskEdits.name
      || mainTaskEdits.complete
      || mainTaskEdits.date
      || mainTaskEdits.inFocus
      || mainTaskEdits.tag
    ) {
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
  const { id, order, type, children, date, forks, ...originalTaskWithoutId } = repeatingTaskMaster;
  const newMainTask: TaskWithoutIdOrderChildren = {
    ...originalTaskWithoutId,
    ...mainTaskEdits,
    date: replaceDate,
    type: 'ONE_TIME',
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
  const batch = database.db().batch();
  const forkId = getNewTaskId();
  asyncAddTask(forkId, newMainTask, newSubTasks, batch).then(() => {
    batch.update(database.tasksCollection().doc(id), {
      forks: firestore.FieldValue.arrayUnion({ forkId, replaceDate }),
    });
    batch.commit();
  });
};

export const removeTask = (task: Task): void => {
  const { tasks, repeatedTaskSet } = store.getState();
  const batch = database.db().batch();
  batch.delete(database.tasksCollection().doc(task.id));
  task.children.forEach((id) => batch.delete(database.subTasksCollection().doc(id)));
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
        batch.update(database.tasksCollection().doc(repeatedTaskId), { forks: newForks });
      }
    });
  } else {
    // also delete all forks
    task.forks.forEach((fork) => {
      const { forkId } = fork;
      if (forkId == null) {
        return;
      }
      batch.delete(database.tasksCollection().doc(forkId));
      const forkedTask = tasks.get(forkId);
      if (forkedTask != null) {
        forkedTask.children.forEach((id) => batch.delete(database.subTasksCollection().doc(id)));
      }
    });
  }
  batch.commit().then(() => {
    reportDeleteTaskEvent();
  });
};

export const removeOneRepeatedTask = (taskId: string, replaceDate: Date): void => {
  database.tasksCollection()
    .doc(taskId)
    .update({
      forks: firestore.FieldValue.arrayUnion({ forkId: null, replaceDate }),
    });
};

export const editMainTask = (
  taskId: string,
  replaceDate: Date | null,
  mainTaskEdits: PartialMainTask,
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
  taskId: string,
  subtaskId: string,
  replaceDate: Date | null,
  partialSubTask: PartialSubTask,
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
  taskId: string,
  subtaskId: string,
  replaceDate: Date | null,
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
  const batch = database.db().batch();
  taskIds.forEach((id) => batch.update(database.tasksCollection().doc(id), { inFocus: false }));
  subTaskIds.forEach(
    (id) => batch.update(database.subTasksCollection().doc(id), { inFocus: false }),
  );
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
  const task = tasks.get(completedTaskIdOrder.id) ?? error('bad');
  const batch = database.db().batch();
  if (task.inFocus) {
    batch.update(database.tasksCollection().doc(task.id), { complete: true });
  }
  task.children.forEach((id) => {
    const s = subTasks.get(id);
    if (s != null && s.inFocus) {
      batch.update(database.subTasksCollection().doc(id), { complete: true });
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
export function applyReorder(orderFor: 'tags' | 'tasks', reorderMap: Map<string, number>): void {
  const collection = orderFor === 'tags'
    ? (id: string) => database.tagsCollection().doc(id)
    : (id: string) => database.tasksCollection().doc(id);
  const batch = database.db().batch();
  reorderMap.forEach((order, id) => {
    batch.update(collection(id), { order });
  });
  batch.commit().then(ignore);
}

export const completeOnboarding = (completedOnboarding: boolean): void => {
  database.settingsCollection()
    .doc(getAppUser().email)
    .update({ completedOnboarding })
    .then(ignore);
};

export const setCanvasCalendar = (canvasCalendar: string | null | undefined): void => {
  database.settingsCollection()
    .doc(getAppUser().email)
    .update({ canvasCalendar })
    .then(ignore);
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
          return (
            task.tag === tag.id
            && name === examName
            && date.getFullYear() === t.getFullYear()
            && date.getMonth() === t.getMonth()
            && date.getDate() === t.getDate()
            && date.getHours() === t.getHours()
          );
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
  actions.orderManager.allocateNewOrder('tasks', newTasks.length).then((startOrder: number) => {
    const newOrderedTasks = newTasks.map((t, i) => ({ ...t, order: i + startOrder }));
    const batch = database.db().batch();
    newOrderedTasks.forEach((orderedTask) => {
      const transformedTask: FirestoreTask = mergeWithOwner({ ...orderedTask, children: [] });
      batch.set(database.tasksCollection().doc(), transformedTask);
    });
    // eslint-disable-next-line no-alert
    batch.commit().then(() => alert('Exams Added Successfully!'));
  });
};
