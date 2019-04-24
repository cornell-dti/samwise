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
} from '../store/store-types';
import {
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
  bannerMessageStatusCollection,
} from './db';
import { error, ignore } from '../util/general-util';
import { emitUndoAddTaskToast, emitUndoRemoveTaskToast } from '../util/undo-util';
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
type TaskWithoutIdOrderChildren = Pick<Task, Exclude<keyof Task, 'id' | 'order' | 'children'>>;

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

export const removeAllForks = (taskId: string): void => {
  const { tasks } = store.getState();
  const task = tasks.get(taskId) || error('bad!');
  const repeatingTask = task as RepeatingTask;
  const forkIds = repeatingTask.forks.map(fork => fork.forkId);
  const batch = db().batch();
  forkIds.forEach((id) => {
    if (id !== null) {
      batch.delete(tasksCollection().doc(id));
    }
  });
  batch.set(tasksCollection().doc(taskId), { forks: [] }, { merge: true });
  batch.commit().then(ignore);
};

type EditType = 'EDITING_MASTER_TEMPLATE' | 'EDITING_ONE_TIME_TASK' | 'FORKING_MASTER_TEMPLATE';

export const editTaskWithDiff = (
  taskId: string,
  editType: EditType,
  { mainTaskEdits, subTaskCreations, subTaskEdits, subTaskDeletions }: Diff,
): void => {
  const batch = db().batch();
  let updateTaskId = taskId;
  if (editType === 'FORKING_MASTER_TEMPLATE') {
    const { tasks, subTasks } = store.getState();
    const repeatingTask = tasks.get(taskId) as RepeatingTask;
    (async () => {
      const createdSubTasks = repeatingTask.children.map((child) => {
        const subtask = subTasks.get(child);
        const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subtask);
        const subtaskDoc = subTasksCollection().doc();
        batch.set(subtaskDoc, firebaseSubTask);
        return { ...subtask, id: subtaskDoc.id };
      });
      await batch.commit();
      const subtaskIds = createdSubTasks.map(s => s.id);
      const taskWithChildren = { ...repeatingTask, children: subtaskIds };
      const firestoreTask: FirestoreTask = await createFirestoreObject('tasks', taskWithChildren);
      const addedDoc = await tasksCollection().add(firestoreTask);
      const newForkMetaData = {
        forkId: addedDoc.id,
        replaceDate: mainTaskEdits.date !== undefined ? mainTaskEdits.date : repeatingTask.date,
      };
      batch.update(tasksCollection().doc(taskId), {
        forks: [...repeatingTask.forks, newForkMetaData],
      });
      updateTaskId = addedDoc.id;
    })();
  }

  if (editType === 'EDITING_MASTER_TEMPLATE') {
    removeAllForks(taskId);
  }
  if (subTaskCreations.size !== 0) {
    subTaskCreations.forEach((subTask, id) => {
      const newSubTaskDoc = subTasksCollection().doc(id);
      const firebaseSubTask: FirestoreSubTask = mergeWithOwner(subTask);
      batch.set(newSubTaskDoc, firebaseSubTask);
      batch.update(tasksCollection().doc(updateTaskId), {
        children: firestore.FieldValue.arrayUnion(newSubTaskDoc.id),
      });
    });
  }
  if (subTaskEdits.size !== 0) {
    subTaskEdits.forEach((partialSubTask, id) => {
      batch.set(subTasksCollection().doc(id), partialSubTask, { merge: true });
    });
  }
  if (subTaskDeletions.size !== 0) {
    subTaskDeletions.forEach((id) => {
      batch.delete(subTasksCollection().doc(id));
    });
  }
  batch.set(tasksCollection().doc(updateTaskId), mainTaskEdits, { merge: true });
};

export const removeTask = (task: Task, noUndo?: 'no-undo'): void => {
  const { subTasks } = store.getState();
  const deletedSubTasks = task.children
    .map((id) => {
      const subTask = subTasks.get(id);
      return subTask == null ? error('corrupted!') : subTask;
    })
    .toArray();
  const batch = db().batch();
  batch.delete(tasksCollection().doc(task.id));
  task.children.forEach(id => batch.delete(subTasksCollection().doc(id)));
  batch.commit().then(() => {
    if (noUndo !== 'no-undo') {
      const { children, ...rest } = task;
      const fullTask = { ...rest, children: deletedSubTasks };
      emitUndoRemoveTaskToast(fullTask);
    }
  });
};

export const editMainTask = (
  taskId: string, editType: EditType, mainTaskEdits: PartialMainTask,
): void => {
  editTaskWithDiff(taskId, editType, {
    mainTaskEdits,
    subTaskCreations: Map(),
    subTaskEdits: Map(),
    subTaskDeletions: Set(),
  });
};

export const editSubTask = (
  taskId: string, subtaskId: string, editType: EditType, partialSubTask: PartialSubTask,
): void => {
  editTaskWithDiff(taskId, editType, {
    mainTaskEdits: {},
    subTaskCreations: Map(),
    subTaskEdits: Map<string, PartialSubTask>().set(subtaskId, partialSubTask),
    subTaskDeletions: Set(),
  });
};

export const removeSubTask = (
  taskId: string, subtaskId: string, editType: EditType,
): void => {
  editTaskWithDiff(taskId, editType, {
    mainTaskEdits: {},
    subTaskCreations: Map(),
    subTaskEdits: Map(),
    subTaskDeletions: Set(subtaskId),
  });
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
  taskIds.forEach(id => batch.update(tasksCollection().doc(id), { inFocus: false }));
  subTaskIds.forEach(id => batch.update(subTasksCollection().doc(id), { inFocus: false }));
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
        const filter = (task: Task): boolean => {
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
      batch.commit().then(() => alert('Exams Added Successfully!'));
    });
};
