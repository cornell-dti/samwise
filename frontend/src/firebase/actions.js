// @flow strict

import firebase from 'firebase/app';
import type {
  Course, PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from '../store/store-types';
import type {
  FirestoreCommon, FirestoreTag, FirestoreTask, FirestoreSubTask, FirestoreTaskChildrenMap,
} from './firestore-types';
import { getAppUser } from './auth';
import {
  db,
  subTasksCollection,
  tagsCollection,
  taskChildrenMapCollection,
  tasksCollection
} from './db';
import { ignore } from '../util/general-util';
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

/*
 * --------------------------------------------------------------------------------
 * Section 1: Tags Actions
 * --------------------------------------------------------------------------------
 */

export const addTag = (tag: WithoutIdOrder<Tag>): void => {
  const { tags } = store.getState();
  const { classId } = tag;
  // $FlowFixMe incomplete typing rules for Object.values.
  if (classId != null && Object.values(tags).some((t: Tag) => t.classId === classId)) {
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
  task: WithoutIdOrder<Task>,
  subTasks: WithoutId<SubTask>[],
  noUndo?: 'no-undo',
): void => {
  const createTaskIdPromise: Promise<string> = (async () => {
    const firestoreTask: FirestoreTask = await createFirestoreObject('tasks', task);
    const addedDoc = await tasksCollection().add(firestoreTask);
    return addedDoc.id;
  })();
  const createSubTaskIdsPromise: Promise<string[]> = (async () => {
    const created: string[] = [];
    const batch = db().batch();
    subTasks.forEach((subtask) => {
      const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subtask);
      const subtaskDoc = tasksCollection().doc();
      created.push(subtaskDoc.id);
      batch.set(subtaskDoc, firebaseSubTask);
    });
    await batch.commit();
    return created;
  })();
  Promise.all([createTaskIdPromise, createSubTaskIdsPromise])
    .then(([createdTaskId, createdSubTaskIds]) => {
      taskChildrenMapCollection()
        .doc(createdTaskId)
        .set({ children: createdSubTaskIds })
        .then(ignore);
    });
  // TODO undo
};

export const addSubTask = (taskId: string, subTask: WithoutId<SubTask>): void => {
  const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subTask);
  subTasksCollection().add(firebaseSubTask).then((doc) => {
    taskChildrenMapCollection()
      .doc(taskId)
      .update({ children: firebase.firestore.FieldValue.arrayUnion(doc.id) })
      .then(ignore);
  });
};

/**
 * @see EditTaskAction
 * @see TaskDiff
 */
export const editTask = (task: Task, diff: TaskDiff): void => {
  const {
    mainTaskDiff, subtasksCreations, subtasksEdits, subtasksDeletions,
  } = diff;
  const batch = db().batch();
  // Handle mainTaskDiff
  batch.set(tasksCollection().doc(task.id), mainTaskDiff, { merge: true });
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
    taskChildrenMapCollection().doc(task.id).update({
      children: firebase.firestore.FieldValue
        .arrayUnion(...createdSubTaskIds)
        .arrayRemove(...subtasksDeletions),
    }).then(ignore);
  });
};

export const editMainTask = (taskId: string, partialMainTask: PartialMainTask): void => {
  tasksCollection().doc(taskId).update(partialMainTask).then(ignore);
};

export const editSubTask = (subtaskId: string, partialSubTask: PartialSubTask): void => {
  tasksCollection().doc(subtaskId).update(partialSubTask).then(ignore);
};

export const removeTask = (taskId: string, subTaskIds: string[], noUndo?: 'no-undo'): void => {
  const batch = db().batch();
  batch.delete(tasksCollection().doc(taskId));
  subTaskIds.forEach(id => batch.delete(tasksCollection().doc(id)));
  batch.commit().then(() => {
    if (noUndo !== 'no-undo') {
      // TODO
      emitUndoRemoveTaskToast(task);
    }
  });
};

export const removeSubTask = (subtaskId: string): void => {
  tasksCollection().doc(subtaskId).delete().then(ignore);
};

/**
 * Clear all the completed tasks in focus view.
 */
export const clearFocus = (taskIds: string[]): void => {
  const batch = db().batch();
  taskIds.forEach(id => batch.update(tasksCollection().doc(id), { inFocus: false }));
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
  const reorderMap = new Map<string, number>(); // key: id, value: new order
  if (sourceOrder < destinationOrder) {
    // wants to go to later places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap.set(element.id, destinationOrder);
      } else if (element.order > sourceOrder && element.order <= destinationOrder) {
        reorderMap.set(element.id, element.order - 1);
      }
    });
  } else {
    // wants to go to earlier places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap.set(element.id, destinationOrder);
      } else if (element.order >= destinationOrder && element.order < sourceOrder) {
        reorderMap.set(element.id, element.order + 1);
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

export const importCourseExams = (): void => {
  const { tags, tasks, courses } = store.getState();
  type SimpleTask = $Diff<WithoutIdOrder<Task>, {| +subtasks: SubTask[] |}>;
  const newTasks: SimpleTask[] = [];
  // $FlowFixMe
  Object.values(tags).forEach((tag: Tag) => {
    if (tag.classId === null) {
      return;
    }
    const allCoursesWithId = courses.get(tag.classId);
    if (allCoursesWithId == null) {
      return; // not an error because it may be courses in previous semesters.
    }
    allCoursesWithId.forEach((course: Course) => {
      course.examTimes.forEach((examTime) => {
        const t = new Date(examTime);
        const filter = (task: Task) => {
          const { name, date } = task;
          return task.tag === tag.id && name === 'Exam'
            && date.getFullYear() === t.getFullYear()
            && date.getMonth() === t.getMonth()
            && date.getDate() === t.getDate()
            && date.getHours() === t.getHours();
        };
        // $FlowFixMe
        if (!Object.values(tasks).some(filter)) {
          const newTask: SimpleTask = {
            name: 'Exam',
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
        const transformedTask: FirestoreTask = mergeWithOwner({
          type: 'TASK', ...orderedTask,
        });
        batch.set(tasksCollection().doc(), transformedTask);
      });
      // eslint-disable-next-line no-alert
      batch.commit().then(() => alert('Exams Added!'));
    });
};
