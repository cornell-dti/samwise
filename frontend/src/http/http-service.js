// @flow strict

import { get, post, put } from '../util/http-util';
import type {
  Tag, SubTask, Task, PartialSubTask, PartialMainTask,
} from '../store/store-types';
import type { BackendPatchLoadedDataAction } from '../store/action-types';
import { backendPatchLoadedData } from '../store/actions';
import { ignore } from '../util/general-util';
import type { BackendTag, BackendTask, BackendTaskWithSubTasks } from './backend-adapter';
import {
  createEditTagRequest, createNewSubTaskRequest, createNewTaskRequest, createEditBackendTaskRequest,
  backendTagToFrontendTag, backendTaskWithSubTasksToFrontendTask, reorganizeBackendTasks,
} from './backend-adapter';

/**
 * Initialize the data from the backend.
 *
 * @return {Promise<BackendPatchLoadedDataAction>} the promise of the backend patch loaded action.
 */
export function httpInitializeData(): Promise<BackendPatchLoadedDataAction> {
  return Promise.all([
    get<BackendTag[]>('/tags/all').then(l => l.map(backendTagToFrontendTag)),
    get<BackendTask[]>('/tasks/all').then(reorganizeBackendTasks),
  ]).then(([tags, tasks]) => backendPatchLoadedData(tags, tasks));
}

/**
 * Create a new tag.
 *
 * @param {Tag} tag tag to create.
 * @return {Promise<number>} promise of the tag id returned by the server.
 */
export const httpNewTag = (tag: Tag): Promise<number> => post<{| +created: BackendTag |}>(
  '/tags/new', createEditTagRequest(tag),
).then(resp => resp.created.tag_id);

/**
 * Edit a tag.
 *
 * @param {Tag} tag the updated tag.
 */
export function httpEditTag(tag: Tag) {
  post(`/tags/${tag.id}/edit`, createEditTagRequest(tag)).then(ignore);
}

/**
 * Delete a tag of the given name.
 *
 * @param {number} tagId id of the tag.
 */
export function httpDeleteTag(tagId: number) {
  put(`/tags/${tagId}/delete`).then(ignore);
}

/**
 * Add a new task.
 *
 * @param {Task} task the new task to add.
 * @return {Promise<Task>} promise of the task from backend.
 */
export function httpAddTask(task: Task): Promise<Task> {
  return post<{| +created: BackendTaskWithSubTasks |}>(
    '/tasks/new', createNewTaskRequest(task),
  ).then(resp => backendTaskWithSubTasksToFrontendTask(resp.created));
}

/**
 * Create a new subtask.
 *
 * @param {Task} mainTask the main task of the subtask's parent.
 * @param {SubTask} subTask the subtask to create.
 * @return {Promise<number>} the subtask id coming from server.
 */
export function httpAddSubTask(mainTask: Task, subTask: SubTask): Promise<number> {
  return post<{| +created: BackendTask |}>(
    '/tasks/new', createNewSubTaskRequest(mainTask, subTask),
  ).then(t => t.created.task_id);
}

/**
 * Delete a task with a task id.
 * Currently, it does not differentiate between main tasks and subtasks.
 *
 * @param {number} taskId the id of the task.
 */
export function httpDeleteTask(taskId: number) {
  put(`/tasks/${taskId}/delete`).then(ignore);
}

/**
 * Edit an existing task or subtask.
 *
 * @param {number} id id of the task or subtask.
 * @param {PartialMainTask | PartialSubTask} partialTask the partial task info.
 * @return {Promise<void>} promise when done.
 */
export async function httpEditBackendTask(
  id: number, partialTask: PartialMainTask | PartialSubTask,
): Promise<void> {
  await post(`/tasks/${id}/edit`, createEditBackendTaskRequest(partialTask));
}

/**
 * Edit an existing task.
 *
 * @param {Task} oldTask the old task used as a reference.
 * @param {Task} newTask the new task to replace the old task.
 * @return {Promise<Task>} the edited task with the latest information from the server.
 */
export async function httpEditTask(oldTask: Task, newTask: Task): Promise<Task> {
  if (oldTask.id !== newTask.id) {
    throw new Error('Inconsistent id of old task and new task.');
  }
  const { id, subtasks, ...partialNewMainTask } = newTask;
  await httpEditBackendTask(id, partialNewMainTask);
  // Deal with subtasks
  const oldTasksIdSet = new Set(oldTask.subtasks.map(s => s.id));
  const editedSubTasks: SubTask[] = [];
  const newSubTasks: SubTask[] = [];
  subtasks.forEach((subTask: SubTask) => {
    if (oldTasksIdSet.has(subTask.id)) {
      editedSubTasks.push(subTask);
      oldTasksIdSet.delete(subTask.id);
    } else {
      newSubTasks.push(subTask);
    }
  });
  const deletedSubTasks: SubTask[] = newTask.subtasks.filter(s => oldTasksIdSet.has(s.id));
  const subTasksEditPromises = editedSubTasks.map((subTask: SubTask) => {
    const { id, ...rest } = subTask;
    return httpEditBackendTask(id, rest).then(() => subTask);
  });
  const subTasksNewPromises = newSubTasks.map(
    (subTask: SubTask) => httpAddSubTask(newTask, subTask).then(i => ({ ...subTask, id: i })),
  );
  const subTasksDeletePromises = deletedSubTasks.map(s => httpDeleteTask(s.id));
  const allDone = await Promise.all([
    ...subTasksNewPromises, ...subTasksEditPromises, ...subTasksDeletePromises,
  ]);
  const newSubtasks: SubTask[] = [];
  allDone.forEach((subtask: SubTask | void) => {
    if (subtask != null) {
      newSubtasks.push(subtask);
    }
  });
  return { ...newTask, subtasks: newSubtasks };
}
