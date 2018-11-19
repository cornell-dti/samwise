// @flow strict

import { get, post } from '../util/http-util';
import type { ColorConfig, Task } from '../store/store-types';

/**
 * Format date for backend.
 * @param {Date} date date to be formatted.
 * @return {string} the formatted date.
 */
function formatDate(date: Date): string {
  function padZero(num: number): string {
    const s = num.toString(10);
    return s.length === 1 ? `0${s}` : s;
  }

  const dateString = `${date.getFullYear()}-${padZero(date.getMonth())}-${padZero(date.getDate())}`;
  const timeString = `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
  return `${dateString} ${timeString}`;
}

/**
 * Create a new tag.
 *
 * @param {string} tag tag to create.
 * @param {string} color color of the new tag.
 * @return {Promise<void>} promise when done.
 */
export async function httpNewTag(tag: string, color: string): Promise<void> {
  await post('/tags/new', { tag, color });
}

/**
 * Returns the promise of a ColorConfig.
 *
 * @return {Promise<ColorConfig>} the promise of a ColorConfig.
 */
export async function httpGetTags(): Promise<ColorConfig> {
  const rawTagList = await get<any[]>('/tags/all');
  const entries: { [_: string]: string }[] = rawTagList.map(e => ({ [e.tag_name]: e.color }));
  // $FlowFixMe
  return Object.assign(...entries);
}

/**
 * Add a new task.
 *
 * @param {Task} task the new task to add.
 * @return {Promise<Task>} promise of the task with new information.
 */
export async function httpAddTask(task: Task): Promise<Task> {
  const data = {
    content: task.name,
    start_date: formatDate(new Date()),
    end_date: formatDate(task.date),
  };
  const serverTask = await post<any>(`/tags/${task.tag}/tasks/new`, data);
  return { ...task, id: (serverTask._order) };
}
