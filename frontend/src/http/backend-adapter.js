// @flow strict

import type {
  PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from '../store/store-types';
import { error } from '../util/general-util';

/**
 * ================================================================================
 * Section 1: Types
 * --------------------------------------------------------------------------------
 * This section defines all the types coming back from the server.
 * They are prefixed with Backend.
 * This is used as a reliable guide for frontend-backend connection.
 * When backend return changes, this file should be updated as well.
 *
 * The types should be exact and immutable, and should contain all the information
 * coming back from backend, even if they are unused.
 * ================================================================================
 */

// Section 1.1: Object Types

type CommonProps = {| +time_created: string; +time_modified: string |};

/**
 * Tag from backend.
 */
export type BackendTag = {|
  +tag_id: number;
  +user_id: string;
  +is_class: boolean;
  +tag_name: string;
  +color: string;
  +_order: number;
  +deleted: boolean;
  ...CommonProps;
|}

/**
 * Task from backend.
 *
 * Note: backend does not have the concept of main task.
 * The relation is modeled by the parent_task field.
 */
export type BackendTask = {|
  +task_id: number;
  +user_id: number;
  +content: string;
  +start_date: string;
  +end_date: string;
  +tag_id: number;
  +parent_task: number | null;
  +_order: number;
  +completed: boolean;
  +in_focus: boolean;
  +deleted: boolean;
  ...CommonProps;
|};

/**
 * Backend task with subtasks.
 */
export type BackendTaskWithSubTasks = {|
  ...BackendTask;
  +subtasks: BackendTask[];
|};

// Section 1.2: Request Types

type EditTagRequest = {| +is_class: boolean; +name: string; +color: string |};

type NewTaskRequest = {|
  +content: string;
  +tag_id: number;
  +start_date: string;
  +end_date: string;
  +subtasks: {| +content: string; +start_date: string; +end_date: string |}[];
|};

type NewSubTaskRequest = {|
  +parent_task: number;
  +content: string;
  +start_date: string;
  +end_date: string;
  +tag_id: number;
  +completed: boolean;
  +in_focus: boolean;
|};

type EditBackendTaskRequest = $Shape<{|
  +content: string;
  +tag_id: number;
  +end_date: string;
  +completed: boolean;
  +in_focus: boolean;
|}>;

/**
 * ================================================================================
 * Section 2: Converters
 * --------------------------------------------------------------------------------
 * The converters between frontend and backend types.
 * ================================================================================
 */

/**
 * Create tag request.
 *
 * @param type type of the tag.
 * @param name name of the tag.
 * @param color color of the tag.
 * @return {EditTagRequest} the created request.
 */
export const createEditTagRequest = ({ type, name, color }: Tag): EditTagRequest => ({
  is_class: type === 'class', name, color,
});

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
  const dateString = `${date.getUTCFullYear()}-${padZero(date.getUTCMonth() + 1)}-${padZero(date.getUTCDate())}`;
  const timeString = `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}:00`;
  return `${dateString} ${timeString}`;
}

/**
 * Create task request.
 *
 * @param {Task} task task to create.
 * @return {NewTaskRequest} new task request.
 */
export const createNewTaskRequest = (task: Task): NewTaskRequest => {
  const startDate = formatDate(new Date());
  const endDate = formatDate(task.date);
  return {
    content: task.name,
    tag_id: task.tag,
    start_date: startDate,
    end_date: endDate,
    subtasks: task.subtasks.map((subTask: SubTask) => ({
      content: subTask.name, start_date: startDate, end_date: endDate,
    })),
  };
};

/**
 * Create a new subtask request.
 *
 * @param {Task} mainTask the main task of the subtask's parent.
 * @param {SubTask} subTask the subtask to create.
 * @return {NewSubTaskRequest} the create new subtask request.
 */
export const createNewSubTaskRequest = (mainTask: Task, subTask: SubTask): NewSubTaskRequest => ({
  parent_task: mainTask.id,
  content: subTask.name,
  start_date: formatDate(new Date()),
  end_date: formatDate(mainTask.date),
  tag_id: mainTask.tag,
  completed: subTask.complete,
  in_focus: subTask.inFocus,
});

/**
 * Create an edit backend task request.
 *
 * @param {PartialMainTask | PartialSubTask} partialTask partial data of the task.
 * @return {EditBackendTaskRequest} an edit backend task request.
 */
export const createEditBackendTaskRequest = (
  partialTask: PartialMainTask | PartialSubTask,
): EditBackendTaskRequest => {
  const { name, complete, inFocus } = partialTask;
  if (partialTask.date == null && partialTask.tag == null) {
    // treat it as a subtask.
    return { content: name, completed: complete, in_focus: inFocus };
  }
  // must be a main task
  const { date, tag } = (partialTask: PartialMainTask); // flow is not smart enough
  return {
    content: name,
    tag_id: tag,
    end_date: formatDate(date),
    completed: complete,
    in_focus: inFocus,
  };
};

/**
 * Convert backend to frontend tag.
 * @param {BackendTag} tag backend tag to convert.
 *
 * @return {Tag} frontend tag.
 */
export const backendTagToFrontendTag = (tag: BackendTag): Tag => ({
  id: tag.tag_id,
  type: tag.is_class ? 'class' : 'other',
  name: tag.tag_name,
  color: tag.color,
});

/**
 * Convert backend task into partial frontend task (task with empty subtasks).
 *
 * @param {BackendTask} backendTask backend task.
 * @return {Task} partial frontend task
 */
const backendTaskToPartialFrontendMainTask = (backendTask: BackendTask): Task => ({
  id: backendTask.task_id,
  name: backendTask.content,
  tag: backendTask.tag_id,
  date: new Date(backendTask.end_date),
  complete: backendTask.completed,
  inFocus: backendTask.in_focus,
  subtasks: [],
});

/**
 * Convert backend task into frontend subtask.
 *
 * @param {BackendTask} backendTask backend task.
 * @return {SubTask} frontend subtask.
 */
const backendTaskToFrontendSubTask = (backendTask: BackendTask): SubTask => ({
  id: backendTask.task_id,
  name: backendTask.content,
  complete: backendTask.completed,
  inFocus: backendTask.in_focus,
});

/**
 * Convert backend task with subtasks into full frontend task.
 *
 * @param {BackendTask} backendTask backend task.
 * @return {Task} full frontend task
 */
export const backendTaskWithSubTasksToFrontendTask = (
  backendTask: BackendTaskWithSubTasks,
): Task => {
  const { subtasks, ...rest } = backendTask;
  const partialTask = backendTaskToPartialFrontendMainTask(rest);
  return { ...partialTask, subtasks: subtasks.map(backendTaskToFrontendSubTask) };
};

/**
 * Reorganize an array of backend tasks with both main task and subtasks into an array of
 * full frontend tasks.
 *
 * @param {BackendTask[]} backendTasks unorganized backend tasks.
 * @return {Task[]} organized frontend tasks.
 */
export function reorganizeBackendTasks(backendTasks: BackendTask[]): Task[] {
  const mainTasks = new Map<number, Task>();
  const serverSubTasks = new Map<number, SubTask[]>(); // key is parent id
  for (let i = 0; i < backendTasks.length; i += 1) {
    const backendTask = backendTasks[i];
    const id = backendTask.task_id;
    const parentTaskId = backendTask.parent_task;
    if (parentTaskId == null) {
      mainTasks.set(id, backendTaskToPartialFrontendMainTask(backendTask));
    } else {
      const arr = serverSubTasks.get(parentTaskId) ?? [];
      arr.push(backendTaskToFrontendSubTask(backendTask));
      serverSubTasks.set(parentTaskId, arr);
    }
  }
  serverSubTasks.forEach((subtasks: SubTask[], parentId: number) => {
    const mainTask = mainTasks.get(parentId) ?? error('Corrupted backend!');
    mainTasks.set(parentId, { ...mainTask, subtasks });
  });
  const assembledTasks: Task[] = [];
  mainTasks.forEach((task: Task) => { assembledTasks.push(task); });
  return assembledTasks;
}
