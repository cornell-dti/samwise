// @flow strict

import type {
  Course, PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from '../store/store-types';
import type {
  FirestoreCommon, FirestoreTag, FirestoreTask, FirestoreSubTask,
} from './firestore-types';
import { getAppUser } from './auth';
import { db, tagsCollection, tasksCollection } from './db';
import { ignore } from '../util/general-util';
import type { TaskDiff } from '../util/task-util';
import { emitUndoAddTaskToast, emitUndoRemoveTaskToast } from '../util/undo-util';
import allocateNewOrder from './order-manager';
import { store } from '../store/store';

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

/*
 * --------------------------------------------------------------------------------
 * Section 1: Tags Actions
 * --------------------------------------------------------------------------------
 */

export const addTag = (tag: WithoutIdOrder<Tag>): void => {
  const { tags } = store.getState();
  const { classId } = tag;
  if (classId != null && tags.some(t => t.classId === classId)) {
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
  tagsCollection().doc(id).delete().then(ignore);
};

/*
 * --------------------------------------------------------------------------------
 * Section 2: Tasks Actions
 * --------------------------------------------------------------------------------
 */

export const addTask = (task: WithoutIdOrder<Task>, noUndo?: 'no-undo'): void => {
  const { subtasks, ...taskWithoutSubtasks } = task;
  const transformedTask = { type: 'TASK', ...taskWithoutSubtasks };
  createFirestoreObject('tasks', transformedTask)
    .then((firestoreTask: FirestoreTask) => {
      tasksCollection().add(firestoreTask).then((addedDoc) => {
        const completeTask = {
          ...task, id: addedDoc.id, order: firestoreTask.order, subtasks: [],
        };
        const batch = db().batch();
        subtasks.forEach((subtask) => {
          const { id: _, ...rest } = subtask;
          const firebaseSubTask: FirestoreSubTask = mergeWithOwner({
            type: 'SUBTASK',
            parent: addedDoc.id,
            ...rest,
          });
          const subtaskDoc = tasksCollection().doc();
          completeTask.subtasks.push({ id: subtaskDoc.id, ...rest });
          batch.set(subtaskDoc, firebaseSubTask);
        });
        batch.commit().then(() => {
          if (noUndo !== 'no-undo') {
            emitUndoAddTaskToast(completeTask);
          }
        });
      });
    });
};

export const addSubTask = (taskId: string, subTask: SubTask): void => {
  const { id, ...rest } = subTask;
  const firebaseSubTask: FirestoreSubTask = mergeWithOwner({
    type: 'SUBTASK', parent: taskId, ...rest,
  });
  tasksCollection().add(firebaseSubTask).then(ignore);
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
  const parent = task.id;
  subtasksCreations.forEach((creation) => {
    const { id, ...rest } = creation;
    const firebaseSubTask: FirestoreSubTask = mergeWithOwner({
      type: 'SUBTASK', parent, ...rest,
    });
    batch.set(tasksCollection().doc(), firebaseSubTask);
  });
  // Handle subtasksEdits
  subtasksEdits.forEach(([subtaskId, edit]) => {
    batch.set(tasksCollection().doc(subtaskId), edit, { merge: true });
  });
  // Handle subtasksDeletions
  subtasksDeletions.forEach(id => batch.delete(tasksCollection().doc(id)));
  batch.commit().then(ignore);
};

export const editMainTask = (taskId: string, partialMainTask: PartialMainTask): void => {
  tasksCollection().doc(taskId).update(partialMainTask).then(ignore);
};

export const editSubTask = (subtaskId: string, partialSubTask: PartialSubTask): void => {
  tasksCollection().doc(subtaskId).update(partialSubTask).then(ignore);
};

export const removeTask = (task: Task, noUndo?: 'no-undo'): void => {
  const batch = db().batch();
  batch.delete(tasksCollection().doc(task.id));
  task.subtasks.forEach(s => batch.delete(tasksCollection().doc(s.id)));
  batch.commit().then(() => {
    if (noUndo !== 'no-undo') {
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

export const importCourseExams = (): void => {
  const { tags, tasks, courses } = store.getState();
  type SimpleTask = $Diff<WithoutIdOrder<Task>, {| +subtasks: SubTask[] |}>;
  const newTasks: SimpleTask[] = [];
  tags.forEach((tag) => {
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
        if (!tasks.some(filter)) {
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
