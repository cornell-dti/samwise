// @flow strict

import { firestore } from 'firebase/app';
import { Map, Set } from 'immutable';
import type {
  Course, PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from '../store/store-types';
import type {
  FirestoreCommon,
  FirestoreTag,
  FirestoreTask,
  FirestoreSubTask,
} from './firestore-types';
import { getAppUser } from './auth';
import {
  db,
  settingsCollection,
  subTasksCollection,
  tagsCollection,
  tasksCollection,
} from './db';
import { error, ignore } from '../util/general-util';
import type { TaskDiff } from '../util/task-util';
import { emitUndoAddTaskToast, emitUndoRemoveTaskToast } from '../util/undo-util';
import allocateNewOrder from './order-manager';
import { store } from '../store/store';
import { NONE_TAG_ID } from '../util/tag-util';

async function createFirestoreObject<-T>(
  orderFor: 'tags' | 'tasks', source: T,
): Promise<{| ...T; ...FirestoreCommon |}> {
  const order = await allocateNewOrder(orderFor);
  return { ...source, owner: getAppUser().email, order };
}

const mergeWithOwner = <T>(obj: T): {| ...T, +owner: string |} => ({
  owner: getAppUser().email, ...obj,
});

type WithoutIdOrder<Props> = $ReadOnly<$Diff<Props, {| +id: string; +order: number |}>>;
type WithoutId<Props> = $ReadOnly<$Diff<Props, {| +id: string; |}>>;
type IdOrderChildren = {| +id: string; +order: number; +children: Set<string>; |};
type TaskWithoutIdOrderChildren = $ReadOnly<$Diff<Task, IdOrderChildren>>;

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
    .then(ignore);
};

export const editTag = (tag: Tag): void => {
  const { id, ...rest } = tag;
  tagsCollection().doc(id).update(rest).then(ignore);
};

export const removeTag = (id: string): void => {
  tasksCollection()
    .where('owner', '==', getAppUser().email)
    .where('tag', '==', id)
    .get()
    .then((s) => {
      const batch = db().batch();
      s.docs.filter(doc => doc.data().type === 'TASK')
        .forEach((doc) => {
          batch.update(tasksCollection().doc(doc.id), { tag: NONE_TAG_ID });
        });
      batch.delete(tagsCollection().doc(id));
      batch.commit().then(ignore);
    });
};

/*
 * --------------------------------------------------------------------------------
 * Section 2: Tasks Actions
 * --------------------------------------------------------------------------------
 */

export const addTask = (
  task: TaskWithoutIdOrderChildren,
  subTasks: WithoutId<SubTask>[],
  noUndo?: 'no-undo',
): void => {
  (async () => {
    // Step 1: Create SubTasks
    const batch = db().batch();
    const createdSubTasks: SubTask[] = subTasks.map((subtask) => {
      const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subtask);
      const subtaskDoc = subTasksCollection().doc();
      batch.set(subtaskDoc, firebaseSubTask);
      return { ...subtask, id: subtaskDoc.id };
    });
    await batch.commit();
    const subtaskIds = createdSubTasks.map(s => s.id);
    // Step 2: Create Task
    const taskWithChildren = { ...task, children: subtaskIds };
    const firestoreTask: FirestoreTask = await createFirestoreObject('tasks', taskWithChildren);
    const addedDoc = await tasksCollection().add(firestoreTask);
    // Step 3: Handle optional UNDO
    if (noUndo !== 'no-undo') {
      const fullTask = {
        ...task,
        id: addedDoc.id,
        order: firestoreTask.order,
        children: createdSubTasks,
      };
      emitUndoAddTaskToast(fullTask);
    }
  })();
};

export const addSubTask = (taskId: string, subTask: WithoutId<SubTask>): SubTask => {
  const newSubTaskDoc = subTasksCollection().doc();
  const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subTask);
  const batch = db().batch();
  batch.set(newSubTaskDoc, firebaseSubTask);
  batch.update(tasksCollection().doc(taskId), {
    children: firestore.FieldValue.arrayUnion(newSubTaskDoc.id),
  });
  batch.commit().then(ignore);
  return { ...subTask, id: newSubTaskDoc.id };
};

/**
 * @see TaskDiff
 */
export const editTask = (taskId: string, diff: TaskDiff): void => {
  const {
    mainTaskDiff, subtasksCreations, subtasksEdits, subtasksDeletions,
  } = diff;
  const batch = db().batch();
  // Handle subtasksCreations
  const createdSubTaskIds = [];
  subtasksCreations.forEach((creation) => {
    const { id, ...rest } = creation;
    const firebaseSubTask: FirestoreSubTask = mergeWithOwner(rest);
    const subTaskDocRef = subTasksCollection().doc();
    createdSubTaskIds.push(subTaskDocRef.id);
    batch.set(subTaskDocRef, firebaseSubTask);
  });
  // Handle subtasksEdits
  subtasksEdits.forEach(([subtaskId, edit]) => {
    batch.set(subTasksCollection().doc(subtaskId), edit, { merge: true });
  });
  // Handle subtasksDeletions
  subtasksDeletions.forEach(id => batch.delete(tasksCollection().doc(id)));
  batch.commit().then(() => {
    const b = db().batch();
    if (createdSubTaskIds.length > 0) {
      b.update(tasksCollection().doc(taskId), {
        ...mainTaskDiff, children: firestore.FieldValue.arrayUnion(...createdSubTaskIds),
      });
    } else {
      b.update(tasksCollection().doc(taskId), { ...mainTaskDiff });
    }
    if (subtasksDeletions.length > 0) {
      b.update(tasksCollection().doc(taskId), {
        children: firestore.FieldValue.arrayRemove(...subtasksDeletions),
      });
    }
    b.commit().then(ignore);
  });
};

export const editMainTask = (taskId: string, partialMainTask: PartialMainTask): void => {
  tasksCollection().doc(taskId).update(partialMainTask).then(ignore);
};

export const editSubTask = (subtaskId: string, partialSubTask: PartialSubTask): void => {
  subTasksCollection().doc(subtaskId).update(partialSubTask).then(ignore);
};

export const removeTask = (task: Task, noUndo?: 'no-undo'): void => {
  const { subTasks } = store.getState();
  const deletedSubTasks = task.children
    .map(id => subTasks.get(id) ?? error('corrupted!'))
    .toArray();
  const batch = db().batch();
  batch.delete(tasksCollection().doc(task.id));
  task.children.forEach(id => batch.delete(subTasksCollection().doc(id)));
  batch.commit().then(() => {
    if (noUndo !== 'no-undo') {
      // TODO
      const { children, ...rest } = task;
      const fullTask = { ...rest, children: deletedSubTasks };
      emitUndoRemoveTaskToast(fullTask);
    }
  });
};

export const removeSubTask = (taskId: string, subtaskId: string): void => {
  const batch = db().batch();
  batch.update(tasksCollection().doc(taskId), {
    children: firestore.FieldValue.arrayRemove(subtaskId),
  });
  batch.delete(subTasksCollection().doc(subtaskId));
  batch.commit().then(ignore);
};

/**
 * Clear all the completed tasks in focus view.
 */
export const clearFocus = (taskIds: string[], subTaskIds: string[]): void => {
  const batch = db().batch();
  taskIds.forEach(id => batch.update(tasksCollection().doc(id), { inFocus: false }));
  subTaskIds.forEach(id => batch.update(subTasksCollection().doc(id), { inFocus: false }));
  batch.commit().then(ignore);
};

/*
 * --------------------------------------------------------------------------------
 * Section 3: Other Compound Actions
 * --------------------------------------------------------------------------------
 */

/**
 * Reorder a list of items by swapping items with order sourceOrder and destinationOrder
 *
 * @param {'tags' | 'tasks'} orderFor whether the reorder is for tags or tasks.
 * @param {array} originalList the original list as a reference.
 * @param {number} sourceOrder where is the dragged item from.
 * @param {number} destinationOrder where the dragged item goes.
 * @return {array} a new list with updated orders.
 */
export function reorder<-T: { +id: string; +order: number }>(
  orderFor: 'tags' | 'tasks',
  originalList: T[],
  sourceOrder: number,
  destinationOrder: number,
): T[] {
  if (sourceOrder === destinationOrder) {
    return originalList;
  }
  const sortedList = originalList.sort((a, b) => a.order - b.order);
  let reorderMap = Map<string, number>(); // key: id, value: new order
  if (sourceOrder < destinationOrder) {
    // wants to go to later places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order > sourceOrder && element.order <= destinationOrder) {
        reorderMap = reorderMap.set(element.id, element.order - 1);
      }
    });
  } else {
    // wants to go to earlier places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order >= destinationOrder && element.order < sourceOrder) {
        reorderMap = reorderMap.set(element.id, element.order + 1);
      }
    });
  }
  for (let i = 0; i < sortedList.length; i += 1) {
    const element = sortedList[i];
    const newOrder = reorderMap.get(element.id);
    if (newOrder != null) {
      sortedList[i] = { ...element, order: newOrder };
    }
  }
  const collection = orderFor === 'tags'
    ? id => tagsCollection().doc(id)
    : id => tasksCollection().doc(id);
  const batch = db().batch();
  reorderMap.forEach((order, id) => {
    batch.update(collection(id), { order });
  });
  batch.commit().then(ignore);
  return sortedList.sort((a, b) => a.order - b.order);
}

export const completeOnboarding = (completedOnboarding: boolean): void => {
  settingsCollection().doc(getAppUser().email)
    .update({ completedOnboarding })
    .then(ignore);
};

export const importCourseExams = (): void => {
  const { tags, tasks, courses } = store.getState();
  const newTasks: TaskWithoutIdOrderChildren[] = [];
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
        const filter = (task: Task) => {
          const { name, date } = task;
          return task.tag === tag.id && name === examName
            && date.getFullYear() === t.getFullYear()
            && date.getMonth() === t.getMonth()
            && date.getDate() === t.getDate()
            && date.getHours() === t.getHours();
        };
        if (!Array.from(tasks.values()).some(filter)) {
          const newTask: TaskWithoutIdOrderChildren = {
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
      batch.commit().then(() => alert('Exams Added!'));
    });
};
