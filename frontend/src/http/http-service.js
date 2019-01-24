// @flow strict

import { get, post, put } from '../util/http-util';
import type {
  Tag, SubTask, Task, PartialSubTask, PartialMainTask,
} from '../store/store-types';
import type { BackendPatchLoadedDataAction } from '../store/action-types';
import { ignore } from '../util/general-util';
import type {
  BackendTag,
  BackendTask,
  BackendTaskWithSubTasks,
} from './backend-adapter';
import {
  createEditTagRequest, createNewSubTaskRequest, createNewTaskRequest, createEditBackendTaskRequest,
  backendTaskWithSubTasksToFrontendTask, createPatchLoadedDataAction,
} from './backend-adapter';
import type { TaskDiff } from '../util/task-util';

/**
 * Initialize the data from the backend.
 *
 * @return {Promise<BackendPatchLoadedDataAction>} the promise of the backend patch loaded action.
 */
export function httpInitializeData(): Promise<BackendPatchLoadedDataAction> {
  return get('/load').then(createPatchLoadedDataAction);
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
 * @param {number} taskId the id of the task or subtask.
 * @return {Promise<void>} promise when done.
 */
export function httpDeleteTask(taskId: number): Promise<void> {
  return put(`/tasks/${taskId}/delete`).then(ignore);
}

/**
 * Edit an existing task or subtask.
 *
 * @param {number} id id of the task or subtask.
 * @param {PartialMainTask | PartialSubTask} partialTask the partial task info.
 * @return {Promise<void>} promise when done.
 */
export function httpEditBackendTask(
  id: number, partialTask: PartialMainTask | PartialSubTask,
): Promise<void> {
  if (Object.keys(partialTask).length === 0) {
    return new Promise<void>(ignore);
  }
  return post(`/tasks/${id}/edit`, createEditBackendTaskRequest(partialTask)).then(ignore);
}

/**
 * Edit an existing task.
 *
 * @param {Task} oldTask the old task used as a reference.
 * @param {TaskDiff} diff diff between the old task and new task.
 * @return {Promise<Task>} the edited task with the latest information from the server.
 */
export function httpEditTask(oldTask: Task, diff: TaskDiff): Promise<Task> {
  const editedMainTask = { ...oldTask, ...diff.mainTaskDiff };
  const addedSubTasks = [];
  const subTasksEditsMap = new Map<number, PartialSubTask>();
  const subtaskIdsToRemove = new Set(diff.subtasksDeletions);
  const editMainTaskPromise = httpEditBackendTask(oldTask.id, diff.mainTaskDiff);
  const addSubTasksPromises = diff.subtasksCreations
    .map(s => httpAddSubTask(editedMainTask, s).then((id: number) => {
      addedSubTasks.push({ ...s, id });
    }));
  const editSubTasksPromises = diff.subtasksEdits.map(([id, s]) => {
    subTasksEditsMap.set(id, s);
    return httpEditBackendTask(id, s);
  });
  const deleteSubTasksPromises = diff.subtasksDeletions.map(httpDeleteTask);
  return Promise.all([
    editMainTaskPromise, ...addSubTasksPromises, ...editSubTasksPromises, deleteSubTasksPromises,
  ]).then(() => {
    const changedSubTasks = [];
    for (let i = 0; i < oldTask.subtasks.length; i += 1) {
      const oldSubTask = oldTask.subtasks[i];
      if (!subtaskIdsToRemove.has(oldSubTask.id)) {
        const diffOpt = subTasksEditsMap.get(oldSubTask.id);
        if (diffOpt == null) {
          changedSubTasks.push(oldSubTask); // no change
        } else {
          changedSubTasks.push({ ...oldSubTask, ...diffOpt }); // apply change
        }
      }
    }
    changedSubTasks.push(...addedSubTasks);
    return { ...editedMainTask, subtasks: changedSubTasks };
  });
}
