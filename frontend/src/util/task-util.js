// @flow strict

import type { SubTask, Task } from '../store/store-types';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 *
 * @author Sam Zhou
 */

/**
 * Replace a task with given id in an array of task.
 *
 * @param {Task[]} tasks the task array to perform the replace operation.
 * @param {number} id the id of the task to be replaced.
 * @param {function(Task): Task | Task} replacer the replacer function or replacement task.
 * @return {Task[]} the new task array.
 */
export const replaceTask = (
  tasks: Task[], id: number, replacer: ((Task) => Task) | Task,
): Task[] => tasks.map((task: Task) => {
  if (task.id !== id) {
    return task;
  }
  return typeof replacer === 'function' ? replacer(task) : replacer;
});

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {SubTask[]} subTasks the subtask array to perform the replace operation.
 * @param {number} id the id of the subtask to be replaced.
 * @param {function(SubTask): SubTask} replacer the replacer function.
 * @return {SubTask[]} the new subtask array.
 */
export const replaceSubTask = (
  subTasks: SubTask[], id: number, replacer: (SubTask) => SubTask,
): SubTask[] => subTasks.map(
  (subTask: SubTask) => (subTask.id === id ? replacer(subTask) : subTask),
);

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {Task[]} tasks the main task array to perform the replace operation.
 * @param {number} mainTaskID the id of the main task to be replaced.
 * @param {number} subTaskID the id of the subtask to be replaced.
 * @param {function(SubTask, Task): SubTask} replacer the replacer function.
 * @return {Task[]} the new subtask array.
 */
export const replaceSubTaskWithinMainTask = (
  tasks: Task[], mainTaskID: number, subTaskID: number,
  replacer: ((SubTask, Task) => SubTask),
): Task[] => replaceTask(tasks, mainTaskID, (task: Task) => ({
  ...task,
  subtaskArray: replaceSubTask(task.subtaskArray, subTaskID, s => replacer(s, task)),
}));
