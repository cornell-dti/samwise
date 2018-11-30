// @flow strict

import { get, post, put } from '../util/http-util';
import type { Tag, SubTask, Task } from '../store/store-types';
import { getIdByTag } from '../util/tag-util';

/**
 * Format date for backend.
 *
 * @param {Date} date date to be formatted.
 * @return {string} the formatted date.
 */
function formatDate(date: Date): string {
  const padZero = (num: number): string => {
    const s = num.toString(10);
    return s.length === 1 ? `0${s}` : s;
  };
  const dateString = `${date.getFullYear()}-${padZero(date.getMonth())}-${padZero(date.getDate())}`;
  const timeString = `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
  return `${dateString} ${timeString}`;
}

/**
 * Returns the promise of a ColorConfig.
 *
 * @return {Promise<Tag[]>} the promise of a ColorConfig.
 */
export async function httpGetTags(): Promise<Tag[]> {
  const rawTagList = await get<any[]>('/tags/all');
  return rawTagList.map((e: any): Tag => ({
    id: e.tag_id,
    type: 'other',
    name: e.tag_name,
    color: e.color,
  }));
}

/**
 * Create a new tag.
 *
 * @param {Tag} tag tag to create.
 * @return {Promise<Tag>} promise of the tag returned by the server.
 */
export async function httpNewTag(tag: Tag): Promise<Tag> {
  const serverTag = await post<any>('/tags/new', { name: tag.name, color: tag.color });
  return { ...tag, id: serverTag.tag_id };
}

/**
 * Edit a tag.
 *
 * @param {Tag} tag the updated tag.
 * @return {Promise<void>} promise when done.
 */
export async function httpEditTag(tag: Tag): Promise<void> {
  const data = { tag_name: tag.name, color: tag.color };
  await post(`/tags/${tag.id}/edit`, data);
}

/**
 * Delete a tag of the given name.
 *
 * @param {number} tagId id of the tag.
 * @return {Promise<void>} promise when done.
 */
export async function httpDeleteTag(tagId: number): Promise<void> {
  await put(`/tags/${tagId}/delete`, {});
}

/**
 * Mark a task.
 *
 * @param {number} taskId id the task.
 * @param {boolean} complete whether to mark as complete or not.
 * @return {Promise<void>} promise when done.
 */
export async function httpMarkTask(taskId: number, complete: boolean): Promise<void> {
  await put(`/tasks/${taskId}/mark`, { complete });
}

/**
 * Pin a task.
 *
 * @param {number} taskId id the task.
 * @param {boolean} inFocus whether to pin or unpin.
 * @return {Promise<void>} promise when done.
 */
export async function httpPinTask(taskId: number, inFocus: boolean): Promise<void> {
  await post(`/tasks/${taskId}/focus`, { focus: inFocus });
}

/**
 * Add a new task.
 *
 * @param {Task} task the new task to add.
 * @param {Tag[]} tags a list of tags as reference.
 * @return {Promise<Task>} promise of the task with new information.
 */
export async function httpAddTask(task: Task, tags: Tag[]): Promise<Task> {
  const data = {
    content: task.name,
    start_date: formatDate(new Date()),
    end_date: formatDate(task.date),
  };
  const tag = getIdByTag(tags, task.tag);
  const serverTask = await post<any>(`/tags/${tag}/tasks/new`, data);
  return { ...task, id: serverTask.task_id };
}

/**
 * Delete a task with a task id.
 * Currently, it does not differentiate between main tasks and subtasks.
 *
 * @param {number} taskId the id of the task.
 * @return {Promise<void>} promise when done.
 */
export async function httpDeleteTask(taskId: number): Promise<void> {
  await put(`/tasks/${taskId}/delete`, {});
}

/**
 * Create a new subtask.
 *
 * @param {Task} mainTask the main task of the subtask's parent.
 * @param {SubTask} subTask the subtask to create.
 * @param {Tag[]} tags a list of tags as reference.
 * @return {Promise<SubTask>} the subtask coming from server with latest information.
 */
export async function httpNewSubTask(
  mainTask: Task, subTask: SubTask, tags: Tag[],
): Promise<SubTask> {
  const {
    id, name, complete, inFocus,
  } = subTask;
  const tag = getIdByTag(tags, mainTask.tag);
  const data = {
    task_id: id,
    parent_task: mainTask.id,
    content: name,
    start_date: formatDate(new Date()),
    end_date: formatDate(mainTask.date),
    tag_id: tag,
    completed: complete,
    in_focus: inFocus,
  };
  const serverSubTask = await post<any>(`/tags/${mainTask.tag}/tasks/new`, data);
  return { ...subTask, id: serverSubTask.task_id };
}

/**
 * Edit an existing subtask.
 *
 * @param {Task} mainTask the main task of the subtask's parent.
 * @param {SubTask} subTask the subtask to edit.
 * @param {Tag[]} tags a list of tags as reference.
 * @return {Promise<SubTask>} the subtask coming from server with latest information.
 */
export async function httpEditSubTask(
  mainTask: Task, subTask: SubTask, tags: Tag[],
): Promise<SubTask> {
  const {
    id, name, complete, inFocus,
  } = subTask;
  const tag = getIdByTag(tags, mainTask.tag);
  const data = {
    task_id: id,
    parent_task: mainTask.id,
    content: name,
    start_date: formatDate(new Date()),
    end_date: formatDate(mainTask.date),
    tag_id: tag,
    completed: complete,
    in_focus: inFocus,
  };
  const serverSubTask = await post<any>(`/tasks/${id}/edit`, data);
  return { ...subTask, id: serverSubTask.task_id };
}

/**
 * Edit an existing task.
 *
 * @param {Task} oldTask the old task used as a reference.
 * @param {Task} newTask the new task to replace the old task.
 * @param {Tag[]} tags a list of tags as reference.
 * @return {Promise<Task>} the edited task with the latest information from the server.
 */
export async function httpEditTask(
  oldTask: Task, newTask: Task, tags: Tag[],
): Promise<Task> {
  if (oldTask.id !== newTask.id) {
    throw new Error('Inconsistent id of old task and new task.');
  }
  const tag = getIdByTag(tags, newTask.tag);
  const mainTaskData = {
    task_id: newTask.id,
    tag_id: tag,
    start_date: formatDate(new Date()),
    end_date: formatDate(newTask.date),
    content: newTask.name,
    completed: newTask.complete,
    in_focus: newTask.inFocus,
  };
  await post<any>(`/tasks/${newTask.id}/edit`, mainTaskData);
  // Deal with subtasks
  const oldTasksIdSet = new Set(oldTask.subtaskArray.map(({ id }: SubTask) => id));
  const editedSubTasks: SubTask[] = [];
  const newSubTasks: SubTask[] = [];
  newTask.subtaskArray.forEach((subTask: SubTask) => {
    const { id } = subTask;
    if (oldTasksIdSet.has(id)) {
      editedSubTasks.push(subTask);
      oldTasksIdSet.delete(id);
    } else {
      newSubTasks.push(subTask);
    }
  });
  const deletedSubTasks: SubTask[] = newTask.subtaskArray.filter(({ id }) => oldTasksIdSet.has(id));
  const subTasksEditPromises = editedSubTasks.map(
    (subTask: SubTask) => httpEditSubTask(newTask, subTask, tags),
  );
  const subTasksNewPromises = newSubTasks.map(
    (subTask: SubTask) => httpNewSubTask(newTask, subTask, tags),
  );
  const subTasksDeletePromises = deletedSubTasks.map(
    ({ id }: SubTask) => httpDeleteTask(id),
  );
  const allDone = await Promise.all([
    ...subTasksNewPromises, ...subTasksEditPromises, ...subTasksDeletePromises,
  ]);
  const subtaskArray: SubTask[] = [];
  allDone.forEach((subtask: SubTask | void) => {
    if (subtask !== undefined) {
      subtaskArray.push(subtask);
    }
  });
  return { ...newTask, subtaskArray };
}
